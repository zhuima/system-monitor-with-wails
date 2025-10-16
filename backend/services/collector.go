package services

import (
	"context"
	"fmt"
	"runtime"
	"sync"
	"time"

	"system-monitor/backend/models"
)

// CollectorService 数据收集服务
type CollectorService struct {
	ctx        context.Context
	interval   time.Duration
	stopCh     chan struct{}
	mu         sync.RWMutex
	lastCPU    *models.CPUInfo
	lastMemory *models.MemoryInfo
	lastDisk   []models.DiskInfo
	lastNetwork []models.NetworkInfo
	lastProcesses []models.ProcessInfo
}

// NewCollectorService 创建新的数据收集服务
func NewCollectorService(ctx context.Context) *CollectorService {
	return &CollectorService{
		ctx:      ctx,
		interval: 2 * time.Second,
		stopCh:   make(chan struct{}),
	}
}

// SetInterval 设置数据收集间隔
func (cs *CollectorService) SetInterval(interval time.Duration) {
	cs.mu.Lock()
	defer cs.mu.Unlock()
	cs.interval = interval
}

// GetSystemInfo 获取系统基本信息
func (cs *CollectorService) GetSystemInfo() (*models.SystemInfo, error) {
	systemInfo, err := models.NewSystemInfo()
	if err != nil {
		return nil, fmt.Errorf("failed to get system info: %w", err)
	}
	return systemInfo, nil
}

// GetCPUInfo 获取CPU信息
func (cs *CollectorService) GetCPUInfo() (*models.CPUInfo, error) {
	cpuInfo, err := models.NewCPUInfo()
	if err != nil {
		return nil, fmt.Errorf("failed to get CPU info: %w", err)
	}

	cs.mu.Lock()
	cs.lastCPU = cpuInfo
	cs.mu.Unlock()

	return cpuInfo, nil
}

// GetMemoryInfo 获取内存信息
func (cs *CollectorService) GetMemoryInfo() (*models.MemoryInfo, error) {
	memoryInfo, err := models.NewMemoryInfo()
	if err != nil {
		return nil, fmt.Errorf("failed to get memory info: %w", err)
	}

	cs.mu.Lock()
	cs.lastMemory = memoryInfo
	cs.mu.Unlock()

	return memoryInfo, nil
}

// GetDiskInfo 获取磁盘信息
func (cs *CollectorService) GetDiskInfo() ([]models.DiskInfo, error) {
	diskInfo, err := models.NewDiskInfo()
	if err != nil {
		return nil, fmt.Errorf("failed to get disk info: %w", err)
	}

	cs.mu.Lock()
	cs.lastDisk = diskInfo
	cs.mu.Unlock()

	return diskInfo, nil
}

// GetNetworkInfo 获取网络信息
func (cs *CollectorService) GetNetworkInfo() ([]models.NetworkInfo, error) {
	networkInfo, err := models.NewNetworkInfo()
	if err != nil {
		return nil, fmt.Errorf("failed to get network info: %w", err)
	}

	cs.mu.Lock()
	cs.lastNetwork = networkInfo
	cs.mu.Unlock()

	return networkInfo, nil
}

// GetProcesses 获取进程列表
func (cs *CollectorService) GetProcesses(sortBy string, order string, limit int) ([]models.ProcessInfo, error) {
	processes, err := models.GetProcesses(sortBy, order, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get processes: %w", err)
	}

	cs.mu.Lock()
	cs.lastProcesses = processes
	cs.mu.Unlock()

	return processes, nil
}

// GetTopProcesses 获取资源使用最高的进程
func (cs *CollectorService) GetTopProcesses(limit int) ([]models.ProcessInfo, error) {
	return cs.GetProcesses("cpu", "desc", limit)
}

// KillProcess 终止进程
func (cs *CollectorService) KillProcess(pid int32) error {
	return models.KillProcess(pid)
}

// GetAllData 获取所有系统数据
func (cs *CollectorService) GetAllData() (map[string]interface{}, error) {
	var wg sync.WaitGroup
	var systemInfo *models.SystemInfo
	var cpuInfo *models.CPUInfo
	var memoryInfo *models.MemoryInfo
	var diskInfo []models.DiskInfo
	var networkInfo []models.NetworkInfo
	var processes []models.ProcessInfo

	var sysErr, cpuErr, memErr, diskErr, netErr, procErr error

	// 并发收集数据
	wg.Add(6)

	// 系统信息
	go func() {
		defer wg.Done()
		systemInfo, sysErr = cs.GetSystemInfo()
	}()

	// CPU信息
	go func() {
		defer wg.Done()
		cpuInfo, cpuErr = cs.GetCPUInfo()
	}()

	// 内存信息
	go func() {
		defer wg.Done()
		memoryInfo, memErr = cs.GetMemoryInfo()
	}()

	// 磁盘信息
	go func() {
		defer wg.Done()
		diskInfo, diskErr = cs.GetDiskInfo()
	}()

	// 网络信息
	go func() {
		defer wg.Done()
		networkInfo, netErr = cs.GetNetworkInfo()
	}()

	// 进程信息
	go func() {
		defer wg.Done()
		processes, procErr = cs.GetTopProcesses(20)
	}()

	wg.Wait()

	// 检查错误
	if sysErr != nil {
		return nil, fmt.Errorf("failed to get system info: %w", sysErr)
	}
	if cpuErr != nil {
		return nil, fmt.Errorf("failed to get CPU info: %w", cpuErr)
	}
	if memErr != nil {
		return nil, fmt.Errorf("failed to get memory info: %w", memErr)
	}
	if diskErr != nil {
		return nil, fmt.Errorf("failed to get disk info: %w", diskErr)
	}
	if netErr != nil {
		return nil, fmt.Errorf("failed to get network info: %w", netErr)
	}
	if procErr != nil {
		return nil, fmt.Errorf("failed to get processes: %w", procErr)
	}

	// 返回收集的数据
	data := map[string]interface{}{
		"system":   systemInfo,
		"cpu":      cpuInfo,
		"memory":   memoryInfo,
		"disk":     diskInfo,
		"network":  networkInfo,
		"processes": processes,
		"timestamp": time.Now(),
	}

	return data, nil
}

// GetLastData 获取上次收集的数据（用于缓存）
func (cs *CollectorService) GetLastData() map[string]interface{} {
	cs.mu.RLock()
	defer cs.mu.RUnlock()

	data := map[string]interface{}{
		"cpu":       cs.lastCPU,
		"memory":    cs.lastMemory,
		"disk":      cs.lastDisk,
		"network":   cs.lastNetwork,
		"processes": cs.lastProcesses,
		"timestamp": time.Now(),
	}

	return data
}

// StartCollection 开始数据收集
func (cs *CollectorService) StartCollection(callback func(data map[string]interface{})) {
	ticker := time.NewTicker(cs.interval)
	defer ticker.Stop()

	for {
		select {
		case <-cs.ctx.Done():
			return
		case <-cs.stopCh:
			return
		case <-ticker.C:
			data, err := cs.GetAllData()
			if err != nil {
				// 记录错误但继续收集
				fmt.Printf("Error collecting data: %v\n", err)
				continue
			}
			callback(data)
		}
	}
}

// StopCollection 停止数据收集
func (cs *CollectorService) StopCollection() {
	close(cs.stopCh)
}

// GetSystemMetrics 获取系统指标摘要
func (cs *CollectorService) GetSystemMetrics() (*models.SystemOverview, error) {
    data, err := cs.GetAllData()
    if err != nil {
        return nil, err
    }

    // 类型断言防护，避免空值或类型不匹配导致 panic
    var systemInfo *models.SystemInfo
    if v, ok := data["system"]; ok {
        systemInfo, _ = v.(*models.SystemInfo)
    }

    var cpuInfo *models.CPUInfo
    if v, ok := data["cpu"]; ok {
        cpuInfo, _ = v.(*models.CPUInfo)
    }

    var memoryInfo *models.MemoryInfo
    if v, ok := data["memory"]; ok {
        memoryInfo, _ = v.(*models.MemoryInfo)
    }

    var diskInfo []models.DiskInfo
    if v, ok := data["disk"]; ok {
        diskInfo, _ = v.([]models.DiskInfo)
    }

    var processes []models.ProcessInfo
    if v, ok := data["processes"]; ok {
        processes, _ = v.([]models.ProcessInfo)
    }

	// 计算总体磁盘使用率
	var totalDiskUsage float64
	if len(diskInfo) > 0 {
		var totalUsed, totalSpace uint64
		for _, disk := range diskInfo {
			totalUsed += disk.Used
			totalSpace += disk.Total
		}
		if totalSpace > 0 {
			totalDiskUsage = (float64(totalUsed) / float64(totalSpace)) * 100
		}
	}

    var cpuUsage float64
    if cpuInfo != nil {
        cpuUsage = cpuInfo.Usage
    }

    var memoryUsage float64
    if memoryInfo != nil {
        memoryUsage = memoryInfo.UsedPercent
    }

    overview := &models.SystemOverview{
        SystemInfo:   systemInfo,
        CPUUsage:     cpuUsage,
        MemoryUsage:  memoryUsage,
        DiskUsage:    totalDiskUsage,
        NetworkSpeed: 0, // 暂时设为0，后续实现
        ProcessCount: len(processes),
        Timestamp:    time.Now(),
    }

	return overview, nil
}

// GetRuntimeInfo 获取运行时信息
func (cs *CollectorService) GetRuntimeInfo() map[string]interface{} {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	return map[string]interface{}{
		"go_version":    runtime.Version(),
		"go_os":         runtime.GOOS,
		"go_arch":       runtime.GOARCH,
		"num_cpu":       runtime.NumCPU(),
		"num_goroutine": runtime.NumGoroutine(),
		"memory": map[string]interface{}{
			"alloc":      m.Alloc,
			"total_alloc": m.TotalAlloc,
			"sys":        m.Sys,
			"num_gc":     m.NumGC,
		},
	}
}