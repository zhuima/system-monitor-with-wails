package services

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"system-monitor/backend/models"
)

// MonitorService 监控服务
type MonitorService struct {
	ctx              context.Context
	collector        *CollectorService
	storageService   *StorageService
	eventManager     *EventManager
	alertingService  *AlertingService
	isMonitoring     bool
	mu               sync.RWMutex
	interval         time.Duration
	stopCh           chan struct{}
}

// NewMonitorService 创建新的监控服务
func NewMonitorService(ctx context.Context, config interface{}, eventManager *EventManager, alertingService *AlertingService) *MonitorService {
	return &MonitorService{
		ctx:             ctx,
		collector:       NewCollectorService(ctx),
		eventManager:    eventManager,
		alertingService: alertingService,
		isMonitoring:    false,
		interval:        2 * time.Second,
		stopCh:          make(chan struct{}),
	}
}

// SetStorageService 设置存储服务
func (ms *MonitorService) SetStorageService(storageService *StorageService) {
	ms.mu.Lock()
	defer ms.mu.Unlock()
	ms.storageService = storageService
}

// Start 开始监控
func (ms *MonitorService) Start() error {
	ms.mu.Lock()
	defer ms.mu.Unlock()

	if ms.isMonitoring {
		return nil
	}

	ms.isMonitoring = true

	// 启动监控循环
	go ms.monitorLoop()

	log.Println("Monitoring service started")
	return nil
}

// Stop 停止监控
func (ms *MonitorService) Stop() {
	ms.mu.Lock()
	defer ms.mu.Unlock()

	if !ms.isMonitoring {
		return
	}

	ms.isMonitoring = false
	close(ms.stopCh)
	ms.stopCh = make(chan struct{})

	log.Println("Monitoring service stopped")
}

// IsMonitoring 检查是否正在监控
func (ms *MonitorService) IsMonitoring() bool {
	ms.mu.RLock()
	defer ms.mu.RUnlock()
	return ms.isMonitoring
}

// SetInterval 设置监控间隔
func (ms *MonitorService) SetInterval(interval time.Duration) {
	ms.mu.Lock()
	defer ms.mu.Unlock()
	ms.interval = interval
}

// GetInterval 获取监控间隔
func (ms *MonitorService) GetInterval() time.Duration {
	ms.mu.RLock()
	defer ms.mu.RUnlock()
	return ms.interval
}

// monitorLoop 监控循环
func (ms *MonitorService) monitorLoop() {
	ticker := time.NewTicker(ms.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ms.ctx.Done():
			return
		case <-ms.stopCh:
			return
		case <-ticker.C:
			ms.collectAndSendData()
		}
	}
}

// collectAndSendData 收集并发送数据
func (ms *MonitorService) collectAndSendData() {
	// 收集系统数据
	data, err := ms.collector.GetAllData()
	if err != nil {
		log.Printf("Error collecting system data: %v", err)
		return
	}

	// 发送数据到前端
	ms.eventManager.EmitSystemData(data)

	// 存储历史数据
	if ms.storageService != nil {
		if err := ms.storageService.StoreHistoryData(data); err != nil {
			log.Printf("Error storing history data: %v", err)
		}
	}

	// 检查告警
	if ms.alertingService != nil {
		if err := ms.alertingService.CheckAlerts(data); err != nil {
			log.Printf("Error checking alerts: %v", err)
		}
	}
}

// GetCurrentData 获取当前数据
func (ms *MonitorService) GetCurrentData() map[string]interface{} {
	data, err := ms.collector.GetAllData()
	if err != nil {
		log.Printf("Error getting current data: %v", err)
		return ms.collector.GetLastData()
	}
	return data
}

// GetSystemInfo 获取系统信息
func (ms *MonitorService) GetSystemInfo() (models.SystemInfo, error) {
	systemInfo, err := ms.collector.GetSystemInfo()
	if err != nil {
		return models.SystemInfo{}, err
	}
	return *systemInfo, nil
}

// GetProcesses 获取进程列表
func (ms *MonitorService) GetProcesses(sortBy string, order string, limit int) ([]models.ProcessInfo, error) {
	return ms.collector.GetProcesses(sortBy, order, limit)
}

// GetHistoryData 获取历史数据
func (ms *MonitorService) GetHistoryData(metric string, duration int) (interface{}, error) {
	if ms.storageService == nil {
		return nil, fmt.Errorf("storage service not available")
	}
	return ms.storageService.GetHistoryData(metric, duration)
}

// KillProcess 终止进程
func (ms *MonitorService) KillProcess(pid int32) error {
	return ms.collector.KillProcess(pid)
}

// GetAlertRules 获取告警规则
func (ms *MonitorService) GetAlertRules() ([]models.AlertRule, error) {
	if ms.alertingService == nil {
		return []models.AlertRule{}, nil
	}
	return ms.alertingService.GetRules()
}

// CreateAlertRule 创建告警规则
func (ms *MonitorService) CreateAlertRule(rule models.AlertRule) error {
	if ms.alertingService == nil {
		return fmt.Errorf("alerting service not available")
	}
	return ms.alertingService.CreateRule(rule)
}

// UpdateAlertRule 更新告警规则
func (ms *MonitorService) UpdateAlertRule(rule models.AlertRule) error {
	if ms.alertingService == nil {
		return fmt.Errorf("alerting service not available")
	}
	return ms.alertingService.UpdateRule(rule)
}

// DeleteAlertRule 删除告警规则
func (ms *MonitorService) DeleteAlertRule(id int64) error {
	if ms.alertingService == nil {
		return fmt.Errorf("alerting service not available")
	}
	return ms.alertingService.DeleteRule(id)
}

// GetAlerts 获取告警列表
func (ms *MonitorService) GetAlerts(limit int) ([]models.Alert, error) {
	if ms.alertingService == nil {
		return []models.Alert{}, nil
	}
	return ms.alertingService.GetAlerts(limit)
}

// GetStatistics 获取监控统计信息
func (ms *MonitorService) GetStatistics() (map[string]interface{}, error) {
	statistics := make(map[string]interface{})

	// 基本信息
	statistics["monitoring"] = ms.IsMonitoring()
	statistics["interval"] = ms.GetInterval().String()
	statistics["timestamp"] = time.Now()

	// 运行时信息
	statistics["runtime"] = ms.collector.GetRuntimeInfo()

	// 当前数据快照
	currentData := ms.collector.GetLastData()
	if currentData != nil {
		statistics["current_data"] = currentData
	}

	return statistics, nil
}