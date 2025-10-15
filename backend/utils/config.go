package utils

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// Config 应用程序配置
type Config struct {
	Monitoring MonitoringConfig `yaml:"monitoring"`
	Alerts     AlertsConfig     `yaml:"alerts"`
	Logging    LoggingConfig    `yaml:"logging"`
	Database   DatabaseConfig   `yaml:"database"`
	UI         UIConfig         `yaml:"ui"`
}

// MonitoringConfig 监控配置
type MonitoringConfig struct {
	RefreshInterval    int `yaml:"refresh_interval"`    // 数据刷新间隔（秒）
	MaxProcesses       int `yaml:"max_processes"`       // 最大进程数量
	HistoryRetention   int `yaml:"history_retention"`   // 历史数据保留天数
	EnableAutoRefresh  bool `yaml:"enable_auto_refresh"` // 启用自动刷新
	CPUAlertThreshold  float64 `yaml:"cpu_alert_threshold"`   // CPU告警阈值
	MemoryAlertThreshold float64 `yaml:"memory_alert_threshold"` // 内存告警阈值
	DiskAlertThreshold float64 `yaml:"disk_alert_threshold"`    // 磁盘告警阈值
}

// AlertsConfig 告警配置
type AlertsConfig struct {
	CPUThreshold     float64 `yaml:"cpu_threshold"`     // CPU使用率告警阈值
	MemoryThreshold  float64 `yaml:"memory_threshold"`  // 内存使用率告警阈值
	DiskThreshold    float64 `yaml:"disk_threshold"`    // 磁盘使用率告警阈值
	NetworkThreshold float64 `yaml:"network_threshold"` // 网络流量告警阈值 (MB/s)
	EnableSounds     bool     `yaml:"enable_sounds"`     // 启用声音提醒
	EnableDesktop    bool     `yaml:"enable_desktop"`    // 启用桌面通知
	EmailEnabled     bool     `yaml:"email_enabled"`     // 启用邮件通知
	EmailRecipient   string   `yaml:"email_recipient"`   // 邮件接收者
	WebhookURL       string   `yaml:"webhook_url"`       // Webhook URL
}

// LoggingConfig 日志配置
type LoggingConfig struct {
	Level       string `yaml:"level"`        // 日志级别 (debug, info, warn, error)
	File        string `yaml:"file"`         // 日志文件路径
	MaxSize     int    `yaml:"max_size"`     // 单个日志文件最大大小 (MB)
	MaxBackups  int    `yaml:"max_backups"`  // 保留的旧日志文件数量
	MaxAge      int    `yaml:"max_age"`      // 保留日志文件的最大天数
	Compress    bool   `yaml:"compress"`     // 是否压缩旧日志文件
	Console     bool   `yaml:"console"`      // 是否输出到控制台
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Path              string `yaml:"path"`                // 数据库文件路径
	MaxConnections    int    `yaml:"max_connections"`     // 最大连接数
	ConnectionTimeout int    `yaml:"connection_timeout"`  // 连接超时时间（秒）
	EnableWAL         bool   `yaml:"enable_wal"`         // 启用WAL模式
	PageSize          int    `yaml:"page_size"`           // 页面大小
	CacheSize         int    `yaml:"cache_size"`          // 缓存大小
}

// UIConfig 用户界面配置
type UIConfig struct {
	Theme            string `yaml:"theme"`              // 主题 (light, dark, auto)
	Language         string `yaml:"language"`           // 界面语言
	WindowWidth      int    `yaml:"window_width"`       // 窗口宽度
	WindowHeight     int    `yaml:"window_height"`      // 窗口高度
	WindowMaximized  bool   `yaml:"window_maximized"`   // 窗口是否最大化
	ShowProcessTree  bool   `yaml:"show_process_tree"`  // 显示进程树
	RefreshRate      int    `yaml:"refresh_rate"`       // 图表刷新率 (毫秒)
	ShowHiddenFiles  bool   `yaml:"show_hidden_files"`  // 显示隐藏文件
}

// DefaultConfig 返回默认配置
func DefaultConfig() *Config {
	return &Config{
		Monitoring: MonitoringConfig{
			RefreshInterval:     2,
			MaxProcesses:        50,
			HistoryRetention:    7,
			EnableAutoRefresh:   true,
			CPUAlertThreshold:   80.0,
			MemoryAlertThreshold: 90.0,
			DiskAlertThreshold:  95.0,
		},
		Alerts: AlertsConfig{
			CPUThreshold:      80.0,
			MemoryThreshold:   90.0,
			DiskThreshold:     95.0,
			NetworkThreshold:  100.0, // 100 MB/s
			EnableSounds:      true,
			EnableDesktop:     true,
			EmailEnabled:      false,
			EmailRecipient:    "",
			WebhookURL:        "",
		},
		Logging: LoggingConfig{
			Level:      "info",
			File:       "data/app.log",
			MaxSize:    10,
			MaxBackups: 5,
			MaxAge:     30,
			Compress:   true,
			Console:    true,
		},
		Database: DatabaseConfig{
			Path:              "data/history.db",
			MaxConnections:    10,
			ConnectionTimeout: 5,
			EnableWAL:         true,
			PageSize:          4096,
			CacheSize:         1000,
		},
		UI: UIConfig{
			Theme:           "auto",
			Language:        "zh-CN",
			WindowWidth:     1200,
			WindowHeight:    800,
			WindowMaximized: false,
			ShowProcessTree: true,
			RefreshRate:     1000,
			ShowHiddenFiles: false,
		},
	}
}

// LoadConfig 加载配置文件
func LoadConfig(configPath string) (*Config, error) {
	// 检查文件是否存在
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// 如果文件不存在，创建默认配置
		config := DefaultConfig()
		if err := config.Save(); err != nil {
			return nil, fmt.Errorf("failed to create default config: %w", err)
		}
		return config, nil
	}

	// 读取配置文件
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	// 解析YAML
	config := DefaultConfig()
	if err := yaml.Unmarshal(data, config); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	// 验证配置
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("invalid config: %w", err)
	}

	return config, nil
}

// Save 保存配置到文件
func (c *Config) Save() error {
	// 确保目录存在
	dir := filepath.Dir(c.Logging.File)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	// 序列化为YAML
	data, err := yaml.Marshal(c)
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	// 写入文件
	if err := os.WriteFile("data/config.yaml", data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}

// Validate 验证配置
func (c *Config) Validate() error {
	// 验证监控配置
	if c.Monitoring.RefreshInterval <= 0 {
		return fmt.Errorf("refresh interval must be positive")
	}
	if c.Monitoring.MaxProcesses <= 0 {
		return fmt.Errorf("max processes must be positive")
	}
	if c.Monitoring.HistoryRetention <= 0 {
		return fmt.Errorf("history retention must be positive")
	}

	// 验证告警配置
	if c.Alerts.CPUThreshold <= 0 || c.Alerts.CPUThreshold > 100 {
		return fmt.Errorf("CPU threshold must be between 0 and 100")
	}
	if c.Alerts.MemoryThreshold <= 0 || c.Alerts.MemoryThreshold > 100 {
		return fmt.Errorf("memory threshold must be between 0 and 100")
	}
	if c.Alerts.DiskThreshold <= 0 || c.Alerts.DiskThreshold > 100 {
		return fmt.Errorf("disk threshold must be between 0 and 100")
	}

	// 验证日志配置
	validLogLevels := map[string]bool{
		"debug": true,
		"info":  true,
		"warn":  true,
		"error": true,
	}
	if !validLogLevels[c.Logging.Level] {
		return fmt.Errorf("invalid log level: %s", c.Logging.Level)
	}

	// 验证UI配置
	validThemes := map[string]bool{
		"light": true,
		"dark":  true,
		"auto":  true,
	}
	if !validThemes[c.UI.Theme] {
		return fmt.Errorf("invalid theme: %s", c.UI.Theme)
	}

	if c.UI.WindowWidth < 800 || c.UI.WindowWidth > 4000 {
		return fmt.Errorf("window width must be between 800 and 4000")
	}
	if c.UI.WindowHeight < 600 || c.UI.WindowHeight > 3000 {
		return fmt.Errorf("window height must be between 600 and 3000")
	}

	return nil
}

// GetDatabasePath 获取数据库路径
func (c *Config) GetDatabasePath() string {
	if c.Database.Path == "" {
		return "data/history.db"
	}
	return c.Database.Path
}

// GetLogLevel 获取日志级别
func (c *Config) GetLogLevel() string {
	if c.Logging.Level == "" {
		return "info"
	}
	return c.Logging.Level
}

// GetLogFile 获取日志文件路径
func (c *Config) GetLogFile() string {
	if c.Logging.File == "" {
		return "data/app.log"
	}
	return c.Logging.File
}