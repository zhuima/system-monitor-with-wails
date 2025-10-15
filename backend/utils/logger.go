package utils

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
)

// Logger 应用程序日志记录器
type Logger struct {
	*logrus.Logger
	file   *os.File
	config *LoggerConfig
}

// LoggerConfig 日志配置
type LoggerConfig struct {
	Level       string `yaml:"level"`
	File        string `yaml:"file"`
	MaxSize     int    `yaml:"max_size"`
	MaxBackups  int    `yaml:"max_backups"`
	MaxAge      int    `yaml:"max_age"`
	Compress    bool   `yaml:"compress"`
	Console     bool   `yaml:"console"`
}

// NewLogger 创建新的日志记录器
func NewLogger(level, file string) (*Logger, error) {
	logger := logrus.New()

	// 设置日志级别
	logLevel, err := logrus.ParseLevel(level)
	if err != nil {
		logLevel = logrus.InfoLevel
	}
	logger.SetLevel(logLevel)

	// 设置日志格式
	logger.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: "2006-01-02 15:04:05",
		ForceColors:     true,
		CallerPrettyfier: func(f *runtime.Frame) (string, string) {
			filename := filepath.Base(f.File)
			return fmt.Sprintf("%s()", f.Function), fmt.Sprintf("%s:%d", filename, f.Line)
		},
	})

	// 如果指定了文件，创建文件输出
	if file != "" {
		// 确保目录存在
		dir := filepath.Dir(file)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create log directory: %w", err)
		}

		// 创建日志文件
		logFile, err := os.OpenFile(file, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			return nil, fmt.Errorf("failed to open log file: %w", err)
		}

		return &Logger{
			Logger: logger,
			file:   logFile,
		}, nil
	}

	return &Logger{
		Logger: logger,
		file:   nil,
	}, nil
}

// NewLoggerWithConfig 使用配置创建日志记录器
func NewLoggerWithConfig(config *LoggerConfig) (*Logger, error) {
	logger := logrus.New()

	// 设置日志级别
	logLevel, err := logrus.ParseLevel(config.Level)
	if err != nil {
		logLevel = logrus.InfoLevel
	}
	logger.SetLevel(logLevel)

	// 设置JSON格式（文件）和文本格式（控制台）
	var writers []io.Writer

	// 文件输出（JSON格式）
	if config.File != "" {
		// 确保目录存在
		dir := filepath.Dir(config.File)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create log directory: %w", err)
		}

		// 使用lumberjack进行日志轮转
		fileWriter := &lumberjack.Logger{
			Filename:   config.File,
			MaxSize:    config.MaxSize,    // MB
			MaxBackups: config.MaxBackups,
			MaxAge:     config.MaxAge,     // days
			Compress:   config.Compress,
		}

		// 为文件创建JSON格式化器
		fileLogger := logrus.New()
		fileLogger.SetLevel(logLevel)
		fileLogger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: "2006-01-02T15:04:05.000Z07:00",
		})

		// 创建一个写入器，将日志格式化后写入文件
		fileWriterWrapper := &formatterWriter{
			writer:   fileWriter,
			formatter: fileLogger.Formatter,
		}

		writers = append(writers, fileWriterWrapper)
	}

	// 控制台输出（文本格式）
	if config.Console {
		// 为控制台创建文本格式化器
		consoleLogger := logrus.New()
		consoleLogger.SetLevel(logLevel)
		consoleLogger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05",
			ForceColors:     true,
			CallerPrettyfier: func(f *runtime.Frame) (string, string) {
				filename := filepath.Base(f.File)
				return fmt.Sprintf("%s()", f.Function), fmt.Sprintf("%s:%d", filename, f.Line)
			},
		})

		consoleWriterWrapper := &formatterWriter{
			writer:   os.Stdout,
			formatter: consoleLogger.Formatter,
		}

		writers = append(writers, consoleWriterWrapper)
	}

	// 设置多重写入器
	if len(writers) > 0 {
		logger.SetOutput(io.MultiWriter(writers...))
	}

	// 启用调用者信息
	logger.SetReportCaller(true)

	return &Logger{
		Logger: logger,
		file:   nil,
		config: config,
	}, nil
}

// formatterWriter 自定义写入器，用于格式化日志
type formatterWriter struct {
	writer   io.Writer
	formatter logrus.Formatter
}

func (w *formatterWriter) Write(p []byte) (n int, err error) {
	// 解析日志条目
	entry, err := logrus.ParseLevel(string(p))
	if err != nil {
		return w.writer.Write(p)
	}

	// 创建日志条目
	logEntry := logrus.New().WithTime(time.Now())
	logEntry.Level = entry
	logEntry.Message = string(p)

	// 格式化日志
	formatted, err := w.formatter.Format(logEntry)
	if err != nil {
		return w.writer.Write(p)
	}

	return w.writer.Write(formatted)
}

// Debug 记录调试信息
func (l *Logger) Debug(format string, args ...interface{}) {
	l.Logger.Debugf(format, args...)
}

// Info 记录一般信息
func (l *Logger) Info(format string, args ...interface{}) {
	l.Logger.Infof(format, args...)
}

// Warn 记录警告信息
func (l *Logger) Warn(format string, args ...interface{}) {
	l.Logger.Warnf(format, args...)
}

// Error 记录错误信息
func (l *Logger) Error(format string, args ...interface{}) {
	l.Logger.Errorf(format, args...)
}

// Fatal 记录致命错误并退出
func (l *Logger) Fatal(format string, args ...interface{}) {
	l.Logger.Fatalf(format, args...)
}

// Panic 记录恐慌信息
func (l *Logger) Panic(format string, args ...interface{}) {
	l.Logger.Panicf(format, args...)
}

// Close 关闭日志记录器
func (l *Logger) Close() error {
	if l.file != nil {
		return l.file.Close()
	}
	return nil
}

// WithField 添加字段
func (l *Logger) WithField(key string, value interface{}) *logrus.Entry {
	return l.Logger.WithField(key, value)
}

// WithFields 添加多个字段
func (l *Logger) WithFields(fields logrus.Fields) *logrus.Entry {
	return l.Logger.WithFields(fields)
}

// WithError 添加错误字段
func (l *Logger) WithError(err error) *logrus.Entry {
	return l.Logger.WithError(err)
}

// SystemInfo 记录系统信息
func (l *Logger) SystemInfo() {
	l.Info("=== System Monitor Starting ===")
	l.Info("Go Version: %s", runtime.Version())
	l.Info("OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)
	l.Info("CPU Count: %d", runtime.NumCPU())
}

// LogSystemMetrics 记录系统指标
func (l *Logger) LogSystemMetrics(cpu float64, memory float64, goroutines int) {
	l.WithFields(logrus.Fields{
		"cpu_percent":    cpu,
		"memory_percent": memory,
		"goroutines":     goroutines,
	}).Info("System metrics")
}

// LogError 记录错误并包含堆栈信息
func (l *Logger) LogError(err error, message string) {
	if err == nil {
		return
	}

	l.WithFields(logrus.Fields{
		"error": err.Error(),
		"stack": getStackTrace(),
	}).Error(message)
}

// getStackTrace 获取堆栈跟踪
func getStackTrace() string {
	buf := make([]byte, 1024)
	for {
		n := runtime.Stack(buf, false)
		if n < len(buf) {
			return string(buf[:n])
		}
		buf = make([]byte, 2*len(buf))
	}
}