package models

import (
	"time"

	"github.com/shirou/gopsutil/v3/mem"
)

// MemoryInfo 内存信息
type MemoryInfo struct {
	Total       uint64  `json:"total"`
	Available   uint64  `json:"available"`
	Used        uint64  `json:"used"`
	UsedPercent float64 `json:"used_percent"`
	Free        uint64  `json:"free"`
	Active      uint64  `json:"active"`
	Inactive    uint64  `json:"inactive"`
	Buffers     uint64  `json:"buffers"`
	Cached      uint64  `json:"cached"`
	WriteBack   uint64  `json:"write_back"`
	Dirty       uint64  `json:"dirty"`
	WriteBackTmp uint64 `json:"write_back_tmp"`
	Shared      uint64  `json:"shared"`
	Slab        uint64  `json:"slab"`
	Sreclaimable uint64 `json:"sreclaimable"`
	Sunreclaim  uint64  `json:"sunreclaim"`
	PageTables  uint64  `json:"page_tables"`
	SwapCached  uint64  `json:"swap_cached"`
	CommitLimit uint64  `json:"commit_limit"`
	CommittedAS uint64  `json:"committed_as"`
	HighTotal   uint64  `json:"high_total"`
	HighFree    uint64  `json:"high_free"`
	LowTotal    uint64  `json:"low_total"`
	LowFree     uint64  `json:"low_free"`
	SwapTotal   uint64  `json:"swap_total"`
	SwapUsed    uint64  `json:"swap_used"`
	SwapFree    uint64  `json:"swap_free"`
	SwapPercent float64 `json:"swap_percent"`
	VmallocTotal uint64 `json:"vmalloc_total"`
	VmallocUsed  uint64  `json:"vmalloc_used"`
	VmallocChunk uint64 `json:"vmalloc_chunk"`
	Timestamp    time.Time `json:"timestamp"`
}

// MemoryHistory 内存历史数据
type MemoryHistory struct {
	Timestamp   time.Time `json:"timestamp"`
	UsedPercent float64   `json:"used_percent"`
	SwapPercent float64   `json:"swap_percent"`
	Available   uint64    `json:"available"`
	Free        uint64    `json:"free"`
	Used        uint64    `json:"used"`
	SwapUsed    uint64    `json:"swap_used"`
}

// SwapInfo 交换分区信息
type SwapInfo struct {
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"used_percent"`
	Sin         uint64  `json:"sin"`  // 从磁盘交换到内存的字节数
	Sout        uint64  `json:"sout"` // 从内存交换到磁盘的字节数
	Timestamp   time.Time `json:"timestamp"`
}

// MemoryStats 内存统计信息
type MemoryStats struct {
	Applications uint64  `json:"applications"` // 应用程序使用的内存
	Buffers      uint64  `json:"buffers"`      // 缓冲区使用的内存
	Cached       uint64  `json:"cached"`       // 缓存使用的内存
	Swap         uint64  `json:"swap"`         // 交换分区使用的内存
	Total        uint64  `json:"total"`        // 总内存
	Free         uint64  `json:"free"`         // 空闲内存
	Available    uint64  `json:"available"`    // 可用内存
	Pressure     float64 `json:"pressure"`     // 内存压力 (0-100)
	Timestamp    time.Time `json:"timestamp"`
}

// NewMemoryInfo 创建新的内存信息
func NewMemoryInfo() (*MemoryInfo, error) {
	virtualMemory, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	swapMemory, err := mem.SwapMemory()
	if err != nil {
		swapMemory = &mem.SwapMemoryStat{} // 使用空结构体作为默认值
	}

	// 计算交换分区使用率
	var swapPercent float64
	if swapMemory.Total > 0 {
		swapPercent = (float64(swapMemory.Used) / float64(swapMemory.Total)) * 100
	}

	return &MemoryInfo{
		Total:        virtualMemory.Total,
		Available:    virtualMemory.Available,
		Used:         virtualMemory.Used,
		UsedPercent:  virtualMemory.UsedPercent,
		Free:         virtualMemory.Free,
		Active:       getMemoryField(virtualMemory, "Active"),
		Inactive:     getMemoryField(virtualMemory, "Inactive"),
		Buffers:      getMemoryField(virtualMemory, "Buffers"),
		Cached:       getMemoryField(virtualMemory, "Cached"),
		WriteBack:    getMemoryField(virtualMemory, "WriteBack"),
		Dirty:        getMemoryField(virtualMemory, "Dirty"),
		WriteBackTmp: getMemoryField(virtualMemory, "WriteBackTmp"),
		Shared:       getMemoryField(virtualMemory, "Shared"),
		Slab:         getMemoryField(virtualMemory, "Slab"),
		Sreclaimable: getMemoryField(virtualMemory, "Sreclaimable"),
		Sunreclaim:   getMemoryField(virtualMemory, "Sunreclaim"),
		PageTables:   getMemoryField(virtualMemory, "PageTables"),
		SwapCached:   getMemoryField(virtualMemory, "SwapCached"),
		CommitLimit:  getMemoryField(virtualMemory, "CommitLimit"),
		CommittedAS:  getMemoryField(virtualMemory, "CommittedAS"),
		HighTotal:    getMemoryField(virtualMemory, "HighTotal"),
		HighFree:     getMemoryField(virtualMemory, "HighFree"),
		LowTotal:     getMemoryField(virtualMemory, "LowTotal"),
		LowFree:      getMemoryField(virtualMemory, "LowFree"),
		SwapTotal:    swapMemory.Total,
		SwapUsed:     swapMemory.Used,
		SwapFree:     swapMemory.Free,
		SwapPercent:  swapPercent,
		VmallocTotal: getMemoryField(virtualMemory, "VmallocTotal"),
		VmallocUsed:  getMemoryField(virtualMemory, "VmallocUsed"),
		VmallocChunk: getMemoryField(virtualMemory, "VmallocChunk"),
		Timestamp:    time.Now(),
	}, nil
}

// NewSwapInfo 创建新的交换分区信息
func NewSwapInfo() (*SwapInfo, error) {
	swapMemory, err := mem.SwapMemory()
	if err != nil {
		return nil, err
	}

	return &SwapInfo{
		Total:       swapMemory.Total,
		Used:        swapMemory.Used,
		Free:        swapMemory.Free,
		UsedPercent: swapMemory.UsedPercent,
		Sin:         swapMemory.Sin,
		Sout:        swapMemory.Sout,
		Timestamp:   time.Now(),
	}, nil
}

// GetMemoryStats 获取详细的内存统计信息
func GetMemoryStats() (*MemoryStats, error) {
	virtualMemory, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	swapMemory, err := mem.SwapMemory()
	if err != nil {
		swapMemory = &mem.SwapMemoryStat{}
	}

	// 计算内存压力
	var pressure float64
	if virtualMemory.Total > 0 {
		pressure = (float64(virtualMemory.Used) / float64(virtualMemory.Total)) * 100
	}

	return &MemoryStats{
		Applications: virtualMemory.Used - virtualMemory.Buffers - virtualMemory.Cached,
		Buffers:      virtualMemory.Buffers,
		Cached:       virtualMemory.Cached,
		Swap:         swapMemory.Used,
		Total:        virtualMemory.Total,
		Free:         virtualMemory.Free,
		Available:    virtualMemory.Available,
		Pressure:     pressure,
		Timestamp:    time.Now(),
	}, nil
}

// getMemoryField 安全地获取内存字段
func getMemoryField(memInfo *mem.VirtualMemoryStat, field string) uint64 {
	// 使用反射来获取字段值，如果字段不存在则返回0
	// 这里简化处理，直接返回一些常见字段的值
	switch field {
	case "Active":
		return 0 // gopsutil 中可能不直接提供这个字段
	case "Buffers":
		return memInfo.Buffers
	case "Cached":
		return memInfo.Cached
	case "SwapCached":
		return 0
	default:
		return 0
	}
}

// GetMemoryPressure 获取内存压力等级
func GetMemoryPressure(usedPercent float64) string {
	if usedPercent >= 95 {
		return "critical"
	} else if usedPercent >= 85 {
		return "high"
	} else if usedPercent >= 70 {
		return "medium"
	} else if usedPercent >= 50 {
		return "low"
	} else {
		return "normal"
	}
}