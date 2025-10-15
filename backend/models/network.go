package models

import (
	"fmt"
	"time"

	"github.com/shirou/gopsutil/v3/net"
)

// NetworkInfo 网络信息
type NetworkInfo struct {
	Name      string    `json:"name"`
	HwAddr    string    `json:"hw_addr"`
	MTU       int       `json:"mtu"`
	Flags     []string  `json:"flags"`
	Addrs     []string  `json:"addrs"`
	BytesSent uint64    `json:"bytes_sent"`
	BytesRecv uint64    `json:"bytes_recv"`
	PacketsSent uint64  `json:"packets_sent"`
	PacketsRecv uint64  `json:"packets_recv"`
	Errin     uint64    `json:"errin"`
	Errout    uint64    `json:"errout"`
	Dropin    uint64    `json:"dropin"`
	Dropout   uint64    `json:"dropout"`
	Timestamp time.Time `json:"timestamp"`
}

// NetworkStatsHistory 网络统计历史
type NetworkStatsHistory struct {
	Timestamp  time.Time `json:"timestamp"`
	Interface  string    `json:"interface"`
	BytesSent  uint64    `json:"bytes_sent"`
	BytesRecv  uint64    `json:"bytes_recv"`
	PacketSent uint64    `json:"packet_sent"`
	PacketRecv uint64    `json:"packet_recv"`
}

// NewNetworkInfo 创建新的网络信息
func NewNetworkInfo() ([]NetworkInfo, error) {
	interfaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}

	// 获取网络统计
	stats, err := net.IOCounters(true)
	if err != nil {
		return nil, err
	}

	// 创建统计映射
	statsMap := make(map[string]net.IOCountersStat)
	for _, stat := range stats {
		statsMap[stat.Name] = stat
	}

	var networkInfos []NetworkInfo

	for _, iface := range interfaces {
		// 获取接口统计
		stat, exists := statsMap[iface.Name]
		if !exists {
			stat = net.IOCountersStat{} // 使用空结构体作为默认值
		}

		// 获取接口地址
		var addrs []string
		for _, addr := range iface.Addrs {
			addrs = append(addrs, addr.Addr)
		}

		networkInfo := NetworkInfo{
			Name:        iface.Name,
			HwAddr:      iface.HardwareAddr,
			MTU:         iface.MTU,
			Flags:       iface.Flags,
			Addrs:       addrs,
			BytesSent:   stat.BytesSent,
			BytesRecv:   stat.BytesRecv,
			PacketsSent: stat.PacketsSent,
			PacketsRecv: stat.PacketsRecv,
			Errin:       stat.Errin,
			Errout:      stat.Errout,
			Dropin:      stat.Dropin,
			Dropout:     stat.Dropout,
			Timestamp:   time.Now(),
		}

		networkInfos = append(networkInfos, networkInfo)
	}

	return networkInfos, nil
}

// GetActiveInterfaces 获取活动网络接口
func GetActiveInterfaces() ([]NetworkInfo, error) {
	allInterfaces, err := NewNetworkInfo()
	if err != nil {
		return nil, err
	}

	var activeInterfaces []NetworkInfo
	for _, iface := range allInterfaces {
		// 检查接口是否活动
		if isInterfaceActive(iface) {
			activeInterfaces = append(activeInterfaces, iface)
		}
	}

	return activeInterfaces, nil
}

// GetInterfaceStats 获取指定接口的统计信息
func GetInterfaceStats(interfaceName string) (*NetworkInfo, error) {
	interfaces, err := NewNetworkInfo()
	if err != nil {
		return nil, err
	}

	for _, iface := range interfaces {
		if iface.Name == interfaceName {
			return &iface, nil
		}
	}

	return nil, fmt.Errorf("interface %s not found", interfaceName)
}

// CalculateNetworkRate 计算网络速率
func CalculateNetworkRate(current, previous *NetworkInfo, duration time.Duration) (uploadRate, downloadRate float64) {
	if previous == nil || duration.Seconds() == 0 {
		return 0, 0
	}

	bytesSentDiff := int64(current.BytesSent - previous.BytesSent)
	bytesRecvDiff := int64(current.BytesRecv - previous.BytesRecv)

	if bytesSentDiff < 0 {
		bytesSentDiff = 0 // 计数器重置
	}
	if bytesRecvDiff < 0 {
		bytesRecvDiff = 0 // 计数器重置
	}

	uploadRate = float64(bytesSentDiff) / duration.Seconds()
	downloadRate = float64(bytesRecvDiff) / duration.Seconds()

	return uploadRate, downloadRate
}

// GetNetworkSummary 获取网络摘要信息
func GetNetworkSummary() (map[string]interface{}, error) {
	interfaces, err := NewNetworkInfo()
	if err != nil {
		return nil, err
	}

	var totalBytesSent, totalBytesRecv uint64
	var totalPacketsSent, totalPacketsRecv uint64
	var totalErrors, totalDrops uint64
	activeCount := 0

	for _, iface := range interfaces {
		if isInterfaceActive(iface) {
			totalBytesSent += iface.BytesSent
			totalBytesRecv += iface.BytesRecv
			totalPacketsSent += iface.PacketsSent
			totalPacketsRecv += iface.PacketsRecv
			totalErrors += iface.Errin + iface.Errout
			totalDrops += iface.Dropin + iface.Dropout
			activeCount++
		}
	}

	return map[string]interface{}{
		"total_interfaces":     len(interfaces),
		"active_interfaces":    activeCount,
		"total_bytes_sent":     totalBytesSent,
		"total_bytes_recv":     totalBytesRecv,
		"total_packets_sent":   totalPacketsSent,
		"total_packets_recv":   totalPacketsRecv,
		"total_errors":         totalErrors,
		"total_drops":          totalDrops,
		"timestamp":            time.Now(),
	}, nil
}

// isInterfaceActive 检查接口是否活动
func isInterfaceActive(iface NetworkInfo) bool {
	// 检查接口是否有流量
	if iface.BytesSent > 0 || iface.BytesRecv > 0 {
		return true
	}

	// 检查接口是否为环回接口
	if iface.Name == "lo" || iface.Name == "Loopback" {
		return false
	}

	// 检查接口是否启用
	for _, flag := range iface.Flags {
		if flag == "up" {
			return true
		}
	}

	return false
}

// GetInterfaceType 获取接口类型
func GetInterfaceType(name string) string {
	switch {
	case name == "lo" || name == "Loopback":
		return "loopback"
	case contains(name, []string{"eth", "en", "Ethernet"}):
		return "ethernet"
	case contains(name, []string{"wlan", "wlp", "Wi-Fi"}):
		return "wifi"
	case contains(name, []string{"ppp", "dialup"}):
		return "dialup"
	case contains(name, []string{"tun", "tap", "vpn"}):
		return "vpn"
	case contains(name, []string{"docker", "veth", "bridge"}):
		return "virtual"
	default:
		return "unknown"
	}
}

// contains 检查字符串是否包含切片中的任意元素
func contains(str string, substrings []string) bool {
	for _, substr := range substrings {
		if len(str) >= len(substr) && str[:len(substr)] == substr {
			return true
		}
	}
	return false
}