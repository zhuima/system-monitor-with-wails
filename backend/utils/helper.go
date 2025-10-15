package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// GetExecutablePath 获取可执行文件路径
func GetExecutablePath() (string, error) {
	execPath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %w", err)
	}
	return filepath.Dir(execPath), nil
}

// GetAppDataDir 获取应用数据目录
func GetAppDataDir() (string, error) {
	var basePath string

	switch runtime.GOOS {
	case "windows":
		// Windows: %APPDATA%
		basePath = os.Getenv("APPDATA")
		if basePath == "" {
			// 备选方案：使用用户主目录
			if home, err := os.UserHomeDir(); err == nil {
				basePath = filepath.Join(home, "AppData", "Roaming")
			}
		}
	case "darwin":
		// macOS: ~/Library/Application Support
		if home, err := os.UserHomeDir(); err == nil {
			basePath = filepath.Join(home, "Library", "Application Support")
		}
	default:
		// Linux 和其他Unix系统: ~/.config 或 XDG_DATA_HOME
		basePath = os.Getenv("XDG_DATA_HOME")
		if basePath == "" {
			if home, err := os.UserHomeDir(); err == nil {
				basePath = filepath.Join(home, ".local", "share")
			}
		}
	}

	if basePath == "" {
		// 最终备选方案：当前目录
		if cwd, err := os.Getwd(); err == nil {
			basePath = cwd
		} else {
			return "", fmt.Errorf("failed to determine app data directory")
		}
	}

	appDir := filepath.Join(basePath, "system-monitor")

	// 确保目录存在
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create app data directory: %w", err)
	}

	return appDir, nil
}

// GetTempDir 获取临时目录
func GetTempDir() (string, error) {
	tempDir := filepath.Join(os.TempDir(), "system-monitor")

	// 确保目录存在
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create temp directory: %w", err)
	}

	return tempDir, nil
}

// FormatBytes 格式化字节数为人类可读的格式
func FormatBytes(bytes uint64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}

	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}

	units := []string{"KB", "MB", "GB", "TB", "PB"}
	return fmt.Sprintf("%.1f %s", float64(bytes)/float64(div), units[exp])
}

// FormatDuration 格式化持续时间为人类可读的格式
func FormatDuration(d time.Duration) string {
	if d < time.Minute {
		return fmt.Sprintf("%.0fs", d.Seconds())
	} else if d < time.Hour {
		return fmt.Sprintf("%.0fm", d.Minutes())
	} else if d < 24*time.Hour {
		return fmt.Sprintf("%.1fh", d.Hours())
	} else {
		return fmt.Sprintf("%.1fd", d.Hours()/24)
	}
}

// FormatPercentage 格式化百分比
func FormatPercentage(value float64) string {
	return fmt.Sprintf("%.1f%%", value)
}

// FormatRate 格式化速率 (bytes/second)
func FormatRate(bytes uint64, duration time.Duration) string {
	if duration == 0 {
		return "0 B/s"
	}

	rate := float64(bytes) / duration.Seconds()
	if rate < 1024 {
		return fmt.Sprintf("%.1f B/s", rate)
	} else if rate < 1024*1024 {
		return fmt.Sprintf("%.1f KB/s", rate/1024)
	} else if rate < 1024*1024*1024 {
		return fmt.Sprintf("%.1f MB/s", rate/(1024*1024))
	} else {
		return fmt.Sprintf("%.1f GB/s", rate/(1024*1024*1024))
	}
}

// ParseFloat64 安全地解析float64
func ParseFloat64(s string) float64 {
	if s == "" {
		return 0
	}

	if value, err := strconv.ParseFloat(s, 64); err == nil {
		return value
	}

	return 0
}

// ParseInt32 安全地解析int32
func ParseInt32(s string) int32 {
	if s == "" {
		return 0
	}

	if value, err := strconv.ParseInt(s, 10, 32); err == nil {
		return int32(value)
	}

	return 0
}

// ParseUint64 安全地解析uint64
func ParseUint64(s string) uint64 {
	if s == "" {
		return 0
	}

	if value, err := strconv.ParseUint(s, 10, 64); err == nil {
		return value
	}

	return 0
}

// SanitizeString 清理字符串
func SanitizeString(s string) string {
	// 移除控制字符
	s = strings.Map(func(r rune) rune {
		if r < 32 && r != '\t' && r != '\n' && r != '\r' {
			return -1
		}
		return r
	}, s)

	// 移除首尾空白
	return strings.TrimSpace(s)
}

// TruncateString 截断字符串
func TruncateString(s string, maxLength int) string {
	if len(s) <= maxLength {
		return s
	}

	if maxLength <= 3 {
		return s[:maxLength]
	}

	return s[:maxLength-3] + "..."
}

// ContainsString 检查字符串是否在切片中
func ContainsString(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// RemoveDuplicateStrings 移除重复的字符串
func RemoveDuplicateStrings(slice []string) []string {
	keys := make(map[string]bool)
	var result []string

	for _, item := range slice {
		if !keys[item] {
			keys[item] = true
			result = append(result, item)
		}
	}

	return result
}

// IsValidURL 检查是否为有效的URL
func IsValidURL(url string) bool {
	return strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://")
}

// IsValidEmail 检查是否为有效的邮箱地址
func IsValidEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// GetCurrentUser 获取当前用户信息
func GetCurrentUser() (*user.User, error) {
	currentUser, err := user.Current()
	if err != nil {
		return nil, fmt.Errorf("failed to get current user: %w", err)
	}
	return currentUser, nil
}

// FileExists 检查文件是否存在
func FileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

// IsDirectory 检查是否为目录
func IsDirectory(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return info.IsDir()
}

// GetFileSize 获取文件大小
func GetFileSize(path string) (int64, error) {
	info, err := os.Stat(path)
	if err != nil {
		return 0, fmt.Errorf("failed to get file size: %w", err)
	}
	return info.Size(), nil
}

// CreateTempFile 创建临时文件
func CreateTempFile(prefix string) (string, error) {
	file, err := os.CreateTemp("", prefix+"-*")
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}
	defer file.Close()

	return file.Name(), nil
}

// JSONMarshalIndent 格式化JSON输出
func JSONMarshalIndent(v interface{}) (string, error) {
	var buf bytes.Buffer
	encoder := json.NewEncoder(&buf)
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "  ")

	if err := encoder.Encode(v); err != nil {
		return "", fmt.Errorf("failed to marshal JSON: %w", err)
	}

	return strings.TrimSpace(buf.String()), nil
}

// SafeGo 安全地启动goroutine
func SafeGo(fn func()) {
	go func() {
		defer func() {
			if r := recover(); r != nil {
				fmt.Printf("Goroutine panic recovered: %v\n", r)
			}
		}()
		fn()
	}()
}

// Retry 重试函数
func Retry(attempts int, sleep time.Duration, fn func() error) error {
	var err error

	for i := 0; i < attempts; i++ {
		if i > 0 {
			time.Sleep(sleep)
		}

		if err = fn(); err == nil {
			return nil
		}
	}

	return fmt.Errorf("after %d attempts, last error: %w", attempts, err)
}

// MinInt 返回两个整数中的最小值
func MinInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// MaxInt 返回两个整数中的最大值
func MaxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// MinFloat64 返回两个浮点数中的最小值
func MinFloat64(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

// MaxFloat64 返回两个浮点数中的最大值
func MaxFloat64(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

// ClampFloat64 将浮点数限制在指定范围内
func ClampFloat64(value, min, max float64) float64 {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

// RoundFloat64 四舍五入到指定小数位数
func RoundFloat64(value float64, precision int) float64 {
	multiplier := 1.0
	for i := 0; i < precision; i++ {
		multiplier *= 10
	}

	return float64(int(value*multiplier+0.5)) / multiplier
}