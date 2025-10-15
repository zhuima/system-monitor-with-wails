package models

import (
	"strings"
	"time"

	"github.com/shirou/gopsutil/v3/disk"
)

// DiskInfo 磁盘信息
type DiskInfo struct {
	Device     string  `json:"device"`
	Mountpoint string  `json:"mountpoint"`
	Fstype     string  `json:"fstype"`
	Opts       string  `json:"opts"`
	Total      uint64  `json:"total"`
	Free       uint64  `json:"free"`
	Used       uint64  `json:"used"`
	UsedPercent float64 `json:"used_percent"`
	Label      string  `json:"label"`
	DevMajor   uint64  `json:"dev_major"`
	DevMinor   uint64  `json:"dev_minor"`
	Filesystem string  `json:"filesystem"`
	IOStats    *DiskIOStats `json:"io_stats,omitempty"`
	Timestamp  time.Time `json:"timestamp"`
}

// DiskIOStats 磁盘I/O统计
type DiskIOStats struct {
	ReadCount         uint64    `json:"read_count"`
	WriteCount        uint64    `json:"write_count"`
	ReadBytes         uint64    `json:"read_bytes"`
	WriteBytes        uint64    `json:"write_bytes"`
	ReadTime          uint64    `json:"read_time"`
	WriteTime         uint64    `json:"write_time"`
	IoTime            uint64    `json:"io_time"`
	WeightedIO        uint64    `json:"weighted_io"`
	Name              string    `json:"name"`
	SerialNumber      string    `json:"serial_number"`
	ModelNumber       string    `json:"model_number"`
	Temperature       float64   `json:"temperature,omitempty"`
	HealthStatus      string    `json:"health_status,omitempty"`
	Timestamp         time.Time `json:"timestamp"`
}

// DiskHistory 磁盘历史数据
type DiskHistory struct {
	Timestamp   time.Time `json:"timestamp"`
	Device      string    `json:"device"`
	Mountpoint  string    `json:"mountpoint"`
	UsedPercent float64   `json:"used_percent"`
	Free        uint64    `json:"free"`
	Used        uint64    `json:"used"`
	ReadBytes   uint64    `json:"read_bytes"`
	WriteBytes  uint64    `json:"write_bytes"`
	ReadTime    uint64    `json:"read_time"`
	WriteTime   uint64    `json:"write_time"`
}

// DiskUsageSummary 磁盘使用摘要
type DiskUsageSummary struct {
	TotalDevices    int     `json:"total_devices"`
	TotalSpace      uint64  `json:"total_space"`
	UsedSpace       uint64  `json:"used_space"`
	FreeSpace       uint64  `json:"free_space"`
	OverallUsage    float64 `json:"overall_usage"`
	CriticalDevices int     `json:"critical_devices"` // 使用率 > 95%
	WarningDevices  int     `json:"warning_devices"`  // 使用率 > 80%
	Timestamp       time.Time `json:"timestamp"`
}

// DiskPartitionStats 磁盘分区统计
type DiskPartitionStats struct {
	PartitionCount    int                    `json:"partition_count"`
	FileSystems       map[string]int         `json:"file_systems"`       // 文件系统类型计数
	TotalPartitions   []DiskInfo             `json:"total_partitions"`
	MountedPartitions []DiskInfo             `json:"mounted_partitions"`
	RemovableMedia    []DiskInfo             `json:"removable_media"`
	Timestamp         time.Time              `json:"timestamp"`
}

// NewDiskInfo 创建新的磁盘信息
func NewDiskInfo() ([]DiskInfo, error) {
	partitions, err := disk.Partitions(false)
	if err != nil {
		return nil, err
	}

	var diskInfos []DiskInfo

	for _, partition := range partitions {
		usage, err := disk.Usage(partition.Mountpoint)
		if err != nil {
			// 如果无法获取使用率，仍然包含分区信息，但设置默认值
			usage = &disk.UsageStat{
				Total: 0,
				Free:  0,
				Used:  0,
				UsedPercent: 0,
			}
		}

		diskInfo := DiskInfo{
			Device:     partition.Device,
			Mountpoint: partition.Mountpoint,
			Fstype:     partition.Fstype,
			Opts:       strings.Join(partition.Opts, ","),
			Total:      usage.Total,
			Free:       usage.Free,
			Used:       usage.Used,
			UsedPercent: usage.UsedPercent,
			Label:      getDiskLabel(partition.Device),
			DevMajor:   0, // gopsutil可能不支持此字段
			DevMinor:   0, // gopsutil可能不支持此字段
			Filesystem: partition.Fstype,
			Timestamp:  time.Now(),
		}

		diskInfos = append(diskInfos, diskInfo)
	}

	return diskInfos, nil
}

// NewDiskIOStats 创建新的磁盘I/O统计
func NewDiskIOStats() ([]DiskIOStats, error) {
	ioStats, err := disk.IOCounters()
	if err != nil {
		return nil, err
	}

	var diskIOStats []DiskIOStats

	for name, stats := range ioStats {
		diskIOStat := DiskIOStats{
			ReadCount:   stats.ReadCount,
			WriteCount:  stats.WriteCount,
			ReadBytes:   stats.ReadBytes,
			WriteBytes:  stats.WriteBytes,
			ReadTime:    stats.ReadTime,
			WriteTime:   stats.WriteTime,
			IoTime:      stats.IoTime,
			WeightedIO:  stats.WeightedIO,
			Name:        name,
			SerialNumber: getDiskSerial(name),
			ModelNumber:  getDiskModel(name),
			Temperature:  getDiskTemperature(name),
			HealthStatus: getDiskHealthStatus(name),
			Timestamp:    time.Now(),
		}

		diskIOStats = append(diskIOStats, diskIOStat)
	}

	return diskIOStats, nil
}

// GetDiskUsageSummary 获取磁盘使用摘要
func GetDiskUsageSummary(diskInfos []DiskInfo) *DiskUsageSummary {
	summary := &DiskUsageSummary{
		Timestamp: time.Now(),
	}

	var totalSpace, usedSpace, freeSpace uint64
	criticalCount, warningCount := 0, 0

	for _, disk := range diskInfos {
		if disk.Total == 0 {
			continue // 跳过无效的磁盘
		}

		totalSpace += disk.Total
		usedSpace += disk.Used
		freeSpace += disk.Free

		// summary.FileSystems[disk.Fstype]++ // 暂时注释掉

		if disk.UsedPercent > 95 {
			criticalCount++
		} else if disk.UsedPercent > 80 {
			warningCount++
		}
	}

	summary.TotalDevices = len(diskInfos)
	summary.TotalSpace = totalSpace
	summary.UsedSpace = usedSpace
	summary.FreeSpace = freeSpace
	summary.CriticalDevices = criticalCount
	summary.WarningDevices = warningCount

	if totalSpace > 0 {
		summary.OverallUsage = (float64(usedSpace) / float64(totalSpace)) * 100
	}

	return summary
}

// GetDiskPartitionStats 获取磁盘分区统计
func GetDiskPartitionStats(diskInfos []DiskInfo) *DiskPartitionStats {
	stats := &DiskPartitionStats{
		PartitionCount:    len(diskInfos),
		FileSystems:       make(map[string]int),
		TotalPartitions:   diskInfos,
		Timestamp:         time.Now(),
	}

	for _, disk := range diskInfos {
		stats.FileSystems[disk.Fstype]++

		// 判断是否已挂载
		if disk.Mountpoint != "" {
			stats.MountedPartitions = append(stats.MountedPartitions, disk)
		}

		// 判断是否为可移动媒体（简化判断）
		if isRemovableMedia(disk) {
			stats.RemovableMedia = append(stats.RemovableMedia, disk)
		}
	}

	return stats
}

// 辅助函数
func getDiskLabel(device string) string {
	// 这里可以实现获取磁盘标签的逻辑
	// 不同平台实现不同
	return ""
}

func getDiskSerial(name string) string {
	// 这里可以实现获取磁盘序列号的逻辑
	// 不同平台实现不同
	return ""
}

func getDiskModel(name string) string {
	// 这里可以实现获取磁盘型号的逻辑
	// 不同平台实现不同
	return ""
}

func getDiskTemperature(name string) float64 {
	// 这里可以实现获取磁盘温度的逻辑
	// 不同平台实现不同
	return 0
}

func getDiskHealthStatus(name string) string {
	// 这里可以实现获取磁盘健康状态的逻辑
	// 不同平台实现不同
	return "unknown"
}

func isRemovableMedia(disk DiskInfo) bool {
	// 简化的判断逻辑
	return disk.Fstype == "iso9660" || disk.Fstype == "udf" || disk.Fstype == "vfat"
}

// GetDiskStatus 获取磁盘状态
func GetDiskStatus(usedPercent float64) string {
	if usedPercent >= 98 {
		return "critical"
	} else if usedPercent >= 90 {
		return "warning"
	} else if usedPercent >= 75 {
		return "caution"
	} else {
		return "normal"
	}
}