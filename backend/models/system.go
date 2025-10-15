package models

import (
	"time"

	"github.com/shirou/gopsutil/v3/host"
)

// SystemInfo 系统信息
type SystemInfo struct {
	Hostname     string    `json:"hostname"`
	OS           string    `json:"os"`
	Platform     string    `json:"platform"`
	PlatformFamily string  `json:"platform_family"`
	PlatformVersion string `json:"platform_version"`
	Architecture string   `json:"architecture"`
	Uptime       uint64    `json:"uptime"`
	BootTime     time.Time `json:"boot_time"`
	Processes    uint64    `json:"processes"`
	KernelVersion string  `json:"kernel_version"`
	KernelArch   string    `json:"kernel_arch"`
	Timestamp    time.Time `json:"timestamp"`
}

// NewSystemInfo 创建新的系统信息
func NewSystemInfo() (*SystemInfo, error) {
	hostInfo, err := host.Info()
	if err != nil {
		return nil, err
	}

	return &SystemInfo{
		Hostname:        hostInfo.Hostname,
		OS:              hostInfo.OS,
		Platform:        hostInfo.Platform,
		PlatformFamily:  hostInfo.PlatformFamily,
		PlatformVersion: hostInfo.PlatformVersion,
		Architecture:    hostInfo.KernelArch,
		Uptime:          hostInfo.Uptime,
		BootTime:        time.Unix(int64(hostInfo.BootTime), 0),
		Processes:       hostInfo.Procs,
		KernelVersion:   hostInfo.KernelVersion,
		KernelArch:      hostInfo.KernelArch,
		Timestamp:       time.Now(),
	}, nil
}

// SystemOverview 系统概览信息
type SystemOverview struct {
	SystemInfo    *SystemInfo `json:"system_info"`
	CPUUsage      float64     `json:"cpu_usage"`
	MemoryUsage   float64     `json:"memory_usage"`
	DiskUsage     float64     `json:"disk_usage"`
	NetworkSpeed  uint64      `json:"network_speed"`
	ProcessCount  int         `json:"process_count"`
	Temperature   float64     `json:"temperature,omitempty"`
	Timestamp     time.Time   `json:"timestamp"`
}

// SystemStatus 系统状态
type SystemStatus string

const (
	StatusHealthy   SystemStatus = "healthy"
	StatusWarning   SystemStatus = "warning"
	StatusCritical  SystemStatus = "critical"
	StatusUnknown   SystemStatus = "unknown"
)

// GetSystemStatus 根据系统指标获取系统状态
func GetSystemStatus(cpu, memory, disk float64) SystemStatus {
	if cpu > 90 || memory > 95 || disk > 98 {
		return StatusCritical
	}
	if cpu > 70 || memory > 80 || disk > 90 {
		return StatusWarning
	}
	return StatusHealthy
}