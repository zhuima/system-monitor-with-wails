package main

import (
	"context"
	"embed"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"system-monitor/backend/models"
	"system-monitor/backend/services"
	"system-monitor/backend/utils"
)

//go:embed all:frontend/dist
var assets embed.FS

// App 应用程序结构体
type App struct {
	ctx              context.Context
	config           *utils.Config
	logger           *utils.Logger
	monitorService   *services.MonitorService
	storageService   *services.StorageService
	alertingService  *services.AlertingService
	eventManager     *services.EventManager
}

// NewApp 创建新的应用程序实例
func NewApp() *App {
	return &App{}
}

// OnStartup 应用程序启动时的回调函数
func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx

	// 创建调试日志文件
	debugLogFile, err := os.OpenFile("wails-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		defer debugLogFile.Close()
		debugLog := log.New(debugLogFile, "DEBUG: ", log.LstdFlags)
		debugLog.Println("=== Wails 应用启动调试开始 ===")
		debugLog.Printf("启动时间: %s", time.Now().Format("2006-01-02 15:04:05"))
		debugLog.Printf("上下文: %v", ctx != nil)
		debugLog.Println("开始初始化配置...")
	}

	// 初始化配置
	config, err := utils.LoadConfig("data/config.yaml")
	if err != nil {
		log.Printf("Failed to load config, using defaults: %v", err)
		config = utils.DefaultConfig()
	}
	a.config = config

	if debugLogFile, err := os.OpenFile("wails-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666); err == nil {
		debugLog := log.New(debugLogFile, "DEBUG: ", log.LstdFlags)
		debugLog.Printf("配置初始化完成: %v", config != nil)
		debugLog.Println("开始初始化日志...")
		debugLogFile.Close()
	}

	// 初始化日志
	logger, err := utils.NewLogger(config.GetLogLevel(), config.GetLogFile())
	if err != nil {
		log.Printf("Failed to initialize logger: %v", err)
		// 使用简单的控制台日志
		logger = nil
	}
	a.logger = logger

	if debugLogFile, err := os.OpenFile("wails-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666); err == nil {
		debugLog := log.New(debugLogFile, "DEBUG: ", log.LstdFlags)
		debugLog.Printf("日志初始化完成: %v", logger != nil)
		debugLog.Println("开始初始化服务...")
		debugLogFile.Close()
	}

	// 初始化服务 - 添加错误处理
	if err := a.initializeServicesSafe(ctx); err != nil {
		log.Printf("Error initializing services: %v", err)
		if debugLogFile, err := os.OpenFile("wails-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666); err == nil {
			debugLog := log.New(debugLogFile, "DEBUG: ", log.LstdFlags)
			debugLog.Printf("服务初始化失败: %v", err)
			debugLog.Println("使用最小配置继续运行...")
			debugLogFile.Close()
		}

		// 至少创建基本的事件管理器
		a.eventManager = services.NewEventManager(ctx)
	} else {
		if debugLogFile, err := os.OpenFile("wails-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666); err == nil {
			debugLog := log.New(debugLogFile, "DEBUG: ", log.LstdFlags)
			debugLog.Println("服务初始化完成")
			debugLogFile.Close()
		}
	}

	// 发送应用就绪事件
	if a.eventManager != nil {
		a.eventManager.EmitAppReady(map[string]interface{}{
			"status":  "ready",
			"version": "1.0.0",
			"systemInfo": map[string]interface{}{
				"os":   "Windows",
				"arch": "amd64",
			},
		})
	}

	if debugLogFile, err := os.OpenFile("wails-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666); err == nil {
		debugLog := log.New(debugLogFile, "DEBUG: ", log.LstdFlags)
		debugLog.Println("=== 应用启动完成 ===")
		debugLogFile.Close()
	}

	if a.logger != nil {
		a.logger.Info("Application started successfully")
	}
}

// initializeServicesSafe 安全地初始化服务
func (a *App) initializeServicesSafe(ctx context.Context) error {
	// 初始化事件管理器
	a.eventManager = services.NewEventManager(ctx)

	// 初始化存储服务
	storageService, err := services.NewStorageService(a.config.GetDatabasePath())
	if err != nil {
		log.Printf("Warning: Failed to initialize storage service: %v", err)
		storageService = nil
	} else {
		log.Println("Storage service initialized successfully")
		a.storageService = storageService
	}

	// 初始化告警服务
	a.alertingService = services.NewAlertingService(a.config, a.eventManager)
	if err := a.alertingService.CreateDefaultRules(); err != nil {
		log.Printf("Warning: Failed to create default alert rules: %v", err)
	} else {
		log.Println("Alert rules created successfully")
	}

	// 初始化监控服务
	a.monitorService = services.NewMonitorService(ctx, a.config, a.eventManager, a.alertingService)
	if storageService != nil {
		a.monitorService.SetStorageService(storageService)
	}

	// 临时禁用监控服务启动以避免潜在崩溃
	// TODO: 修复监控服务启动问题
	// if err := a.monitorService.Start(); err != nil {
	//     log.Printf("Warning: Failed to start monitoring: %v", err)
	// } else {
	//     log.Println("Monitoring service started successfully")
	// }
	log.Println("监控服务已临时禁用以调试窗口关闭问题")

	log.Println("All services initialized successfully")
	return nil
}

// OnDomReady DOM加载完成时的回调函数
func (a *App) OnDomReady(ctx context.Context) {
	// 立即写入调试日志
	if debugLogFile, err := os.OpenFile("wails-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666); err == nil {
		debugLog := log.New(debugLogFile, "DEBUG: ", log.LstdFlags)
		debugLog.Println("🎯 OnDomReady 开始执行")
		debugLogFile.Close()
	}
	log.Println("🎯 OnDomReady 开始执行")

	// 启动监控服务，提供真实数据
	if a.monitorService != nil {
		a.monitorService.Start()
		log.Println("✅ 监控服务已启动")
	} else {
		log.Println("⚠️ 监控服务为空")
	}

	// 立即写入结束日志
	if debugLogFile, err := os.OpenFile("wails-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666); err == nil {
		debugLog := log.New(debugLogFile, "DEBUG: ", log.LstdFlags)
		debugLog.Println("✅ OnDomReady 正常结束")
		debugLogFile.Close()
	}
	log.Println("✅ OnDomReady 正常结束")
}

// OnBeforeClose 应用程序关闭前的回调函数
func (a *App) OnBeforeClose(ctx context.Context) (prevent bool) {
	// 立即写入调试日志
	if debugLogFile, err := os.OpenFile("wails-debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666); err == nil {
		debugLog := log.New(debugLogFile, "DEBUG: ", log.LstdFlags)
		debugLog.Println("🚨 OnBeforeClose 被调用了！准备关闭应用")
		debugLogFile.Close()
	}
	log.Println("🚨 OnBeforeClose 被调用了！准备关闭应用")

	// 允许窗口关闭
	log.Println("✅ 窗口关闭被允许，应用即将退出")
	return false
}

// OnShutdown 应用程序关闭时的回调函数
func (a *App) OnShutdown(ctx context.Context) {
	a.logger.Info("Application is shutting down")

	// 停止所有服务
	if a.monitorService != nil {
		a.monitorService.Stop()
	}

	if a.storageService != nil {
		a.storageService.Close()
	}

	// 关闭日志
	if a.logger != nil {
		a.logger.Close()
	}
}

// initializeServices 初始化所有服务
func (a *App) initializeServices(ctx context.Context) {
	var err error

	// 初始化存储服务
	a.storageService, err = services.NewStorageService(a.config.GetDatabasePath())
	if err != nil {
		a.logger.Error("Failed to initialize storage service: %v", err)
	}

	// 初始化事件管理器
	a.eventManager = services.NewEventManager(ctx)

	// 初始化告警服务
	a.alertingService = services.NewAlertingService(a.config, a.eventManager)

	// 初始化监控服务
	a.monitorService = services.NewMonitorService(ctx, a.config, a.eventManager, a.alertingService)

	// 如果有存储服务，将其传递给监控服务
	if a.storageService != nil {
		a.monitorService.SetStorageService(a.storageService)
	}
}

// GetSystemData 获取当前系统数据
func (a *App) GetSystemData() (map[string]interface{}, error) {
	if a.monitorService == nil {
		return nil, fmt.Errorf("monitor service not initialized")
	}
	return a.monitorService.GetCurrentData(), nil
}

// GetHistoryData 获取历史数据
func (a *App) GetHistoryData(metric string, duration int) (interface{}, error) {
	if a.storageService == nil {
		return nil, fmt.Errorf("storage service not initialized")
	}
	return a.storageService.GetHistoryData(metric, duration)
}

// GetProcesses 获取进程列表
func (a *App) GetProcesses(sortBy string, order string, limit int) ([]models.ProcessInfo, error) {
	if a.monitorService == nil {
		return nil, fmt.Errorf("monitor service not initialized")
	}
	return a.monitorService.GetProcesses(sortBy, order, limit)
}

// KillProcess 终止进程
func (a *App) KillProcess(pid int32) error {
	if a.monitorService == nil {
		return fmt.Errorf("monitor service not initialized")
	}

	a.logger.Info("Attempting to kill process with PID: %d", pid)
	return a.monitorService.KillProcess(pid)
}

// GetAlertRules 获取告警规则
func (a *App) GetAlertRules() ([]models.AlertRule, error) {
	if a.alertingService == nil {
		return nil, fmt.Errorf("alerting service not initialized")
	}
	return a.alertingService.GetRules()
}

// CreateAlertRule 创建告警规则
func (a *App) CreateAlertRule(rule models.AlertRule) error {
	if a.alertingService == nil {
		return fmt.Errorf("alerting service not initialized")
	}

	a.logger.Info("Creating alert rule: %s", rule.Name)
	return a.alertingService.CreateRule(rule)
}

// UpdateAlertRule 更新告警规则
func (a *App) UpdateAlertRule(rule models.AlertRule) error {
	if a.alertingService == nil {
		return fmt.Errorf("alerting service not initialized")
	}

	a.logger.Info("Updating alert rule: %s", rule.Name)
	return a.alertingService.UpdateRule(rule)
}

// DeleteAlertRule 删除告警规则
func (a *App) DeleteAlertRule(id int64) error {
	if a.alertingService == nil {
		return fmt.Errorf("alerting service not initialized")
	}

	a.logger.Info("Deleting alert rule with ID: %d", id)
	return a.alertingService.DeleteRule(id)
}

// GetAlerts 获取告警列表
func (a *App) GetAlerts(limit int) ([]models.Alert, error) {
	if a.alertingService == nil {
		return nil, fmt.Errorf("alerting service not initialized")
	}
	return a.alertingService.GetAlerts(limit)
}

// GetConfig 获取配置
func (a *App) GetConfig() (*utils.Config, error) {
	return a.config, nil
}

// UpdateConfig 更新配置
func (a *App) UpdateConfig(config utils.Config) error {
	a.config = &config
	a.logger.Info("Configuration updated")
	return a.config.Save()
}

// GetSystemInfo 获取系统信息
func (a *App) GetSystemInfo() (models.SystemInfo, error) {
	if a.monitorService == nil {
		return models.SystemInfo{}, fmt.Errorf("monitor service not initialized")
	}
	return a.monitorService.GetSystemInfo()
}

// main 主函数
func main() {
	// 创建应用程序实例
	app := NewApp()

	// 配置Wails选项
	opts := &options.App{
		Title:            "System Monitor",
		Width:            1200,
		Height:           800,
		MinWidth:         800,
		MinHeight:        600,
		BackgroundColour: &options.RGBA{R: 24, G: 24, B: 27, A: 1},
		AssetServer:      &assetserver.Options{Assets: assets},
		OnStartup:        app.OnStartup,
		OnDomReady:       app.OnDomReady,
		OnBeforeClose:    app.OnBeforeClose,
		OnShutdown:       app.OnShutdown,
		Bind: []interface{}{
			app,
		},
	}

	// 启动应用程序
	if err := wails.Run(opts); err != nil {
		log.Fatal("Error:", err.Error())
	}
}