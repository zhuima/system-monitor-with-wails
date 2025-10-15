package models

import (
	"fmt"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/load"
)

// CPUInfo CPU信息
type CPUInfo struct {
	ModelName    string    `json:"model_name"`
	VendorID     string    `json:"vendor_id"`
	Family       string    `json:"family"`
	Model        string    `json:"model"`
	Stepping     string    `json:"stepping"`
	Cores        int32     `json:"cores"`
	LogicalCores int32     `json:"logical_cores"`
	Speed        float64   `json:"speed"`
	CacheSize    int32     `json:"cache_size"`
	Usage        float64   `json:"usage"`
	UsagePerCore []float64 `json:"usage_per_core"`
	Load1        float64   `json:"load1"`
	Load5        float64   `json:"load5"`
	Load15       float64   `json:"load15"`
	Timestamp    time.Time `json:"timestamp"`
}

// CPUHistory CPU历史数据
type CPUHistory struct {
	Timestamp time.Time `json:"timestamp"`
	Usage     float64   `json:"usage"`
	Load1     float64   `json:"load1"`
	Load5     float64   `json:"load5"`
	Load15    float64   `json:"load15"`
	PerCore   []float64 `json:"per_core"`
}

// CPUStats CPU统计信息
type CPUStats struct {
	TotalUsage   float64 `json:"total_usage"`
	UserUsage    float64 `json:"user_usage"`
	SystemUsage  float64 `json:"system_usage"`
	IdleUsage    float64 `json:"idle_usage"`
	IowaitUsage  float64 `json:"iowait_usage"`
	IrqUsage     float64 `json:"irq_usage"`
	SoftirqUsage float64 `json:"softirq_usage"`
	StealUsage   float64 `json:"steal_usage"`
	GuestUsage   float64 `json:"guest_usage"`
	Timestamp    time.Time `json:"timestamp"`
}

// NewCPUInfo 创建新的CPU信息
func NewCPUInfo() (*CPUInfo, error) {
	// 获取CPU信息
	cpuInfo, err := cpu.Info()
	if err != nil {
		return nil, err
	}

	// 获取CPU使用率
	percentPerCore, err := cpu.Percent(time.Second, true)
	if err != nil {
		return nil, err
	}

	// 计算总体使用率
	var totalUsage float64
	if len(percentPerCore) > 0 {
		for _, usage := range percentPerCore {
			totalUsage += usage
		}
		totalUsage = totalUsage / float64(len(percentPerCore))
	}

	// 获取系统负载
	loadInfo, err := load.Avg()
	if err != nil {
		loadInfo = &load.AvgStat{} // 使用空结构体作为默认值
	}

	// 使用第一个CPU的信息作为主要信息
	var mainCPU cpu.InfoStat
	if len(cpuInfo) > 0 {
		mainCPU = cpuInfo[0]
	}

	return &CPUInfo{
		ModelName:    mainCPU.ModelName,
		VendorID:     mainCPU.VendorID,
		Family:       mainCPU.Family,
		Model:        mainCPU.Model,
		Stepping:     fmt.Sprintf("%d", mainCPU.Stepping),
		Cores:        mainCPU.Cores,
		LogicalCores: mainCPU.Cores,
		Speed:        mainCPU.Mhz,
		CacheSize:    mainCPU.CacheSize,
		Usage:        totalUsage,
		UsagePerCore: percentPerCore,
		Load1:        loadInfo.Load1,
		Load5:        loadInfo.Load5,
		Load15:       loadInfo.Load15,
		Timestamp:    time.Now(),
	}, nil
}

// GetCPUStats 获取详细的CPU统计信息
func GetCPUStats() (*CPUStats, error) {
	times, err := cpu.Times(false)
	if err != nil {
		return nil, err
	}

	if len(times) == 0 {
		return &CPUStats{
			Timestamp: time.Now(),
		}, nil
	}

	t := times[0]
	total := t.User + t.System + t.Idle + t.Nice + t.Iowait + t.Irq + t.Softirq + t.Steal + t.Guest + t.GuestNice

	if total == 0 {
		return &CPUStats{
			Timestamp: time.Now(),
		}, nil
	}

	// 转换为百分比
	return &CPUStats{
		TotalUsage:   ((t.User + t.System + t.Nice + t.Iowait + t.Irq + t.Softirq + t.Steal + t.Guest + t.GuestNice) / total) * 100,
		UserUsage:    (t.User / total) * 100,
		SystemUsage:  (t.System / total) * 100,
		IdleUsage:    (t.Idle / total) * 100,
		IowaitUsage:  (t.Iowait / total) * 100,
		IrqUsage:     (t.Irq / total) * 100,
		SoftirqUsage: (t.Softirq / total) * 100,
		StealUsage:   (t.Steal / total) * 100,
		GuestUsage:   (t.Guest / total) * 100,
		Timestamp:    time.Now(),
	}, nil
}

// GetCPUTemperature 获取CPU温度（如果支持）
func GetCPUTemperature() (float64, error) {
	// 这里可以添加获取CPU温度的逻辑
	// 由于不同平台实现不同，这里返回0表示不支持
	return 0, nil
}