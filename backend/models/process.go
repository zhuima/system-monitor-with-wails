package models

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/shirou/gopsutil/v3/process"
)

// ProcessTimes 进程时间信息
type ProcessTimes struct {
	User    float64 `json:"user"`
	System  float64 `json:"system"`
	Idle    float64 `json:"idle"`
	Nice    float64 `json:"nice"`
	Iowait  float64 `json:"iowait"`
	Irq     float64 `json:"irq"`
	Softirq float64 `json:"softirq"`
	Steal   float64 `json:"steal"`
	Guest   float64 `json:"guest"`
}

// AlertRule 告警规则
type AlertRule struct {
	ID          int64           `json:"id"`
	Name        string          `json:"name"`
	Metric      string          `json:"metric"`
	Operator    string          `json:"operator"`
	Threshold   float64         `json:"threshold"`
	Duration    time.Duration   `json:"duration"`
	Enabled     bool            `json:"enabled"`
	Actions     []AlertAction   `json:"actions"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

// AlertAction 告警动作
type AlertAction struct {
	Type   string `json:"type"`
	Target string `json:"target"`
	Level  string `json:"level"`
}

// Alert 告警
type Alert struct {
	ID         int64      `json:"id"`
	RuleID     int64      `json:"rule_id"`
	RuleName   string     `json:"rule_name"`
	Message    string     `json:"message"`
	Level      string     `json:"level"`
	Value      float64    `json:"value"`
	Threshold  float64    `json:"threshold"`
	Status     string     `json:"status"`
	CreatedAt  time.Time  `json:"created_at"`
	ResolvedAt *time.Time `json:"resolved_at"`
}

// ProcessInfo 进程信息
type ProcessInfo struct {
	PID         int32            `json:"pid"`
	Name        string           `json:"name"`
	Status      string           `json:"status"`
	PPID        int32            `json:"ppid"`
	Pgid        int32            `json:"pgid"`
	NumThreads  int32            `json:"num_threads"`
	MemUsage    float32          `json:"mem_usage"`
	MemRSS      uint64           `json:"mem_rss"`
	MemVMS      uint64           `json:"mem_vms"`
	CPUPercent  float64          `json:"cpu_percent"`
	Times       ProcessTimes    `json:"times"`
	CreateTime  int64            `json:"create_time"`
	Cwd         string           `json:"cwd"`
	Exe         string           `json:"exe"`
	Cmdline     string           `json:"cmdline"`
	Username    string           `json:"username"`
	Children    []int32          `json:"children"`
	Parent      *int32           `json:"parent,omitempty"`
	Timestamp   time.Time        `json:"timestamp"`
}

// ProcessTree 进程树结构
type ProcessTree struct {
	ProcessInfo *ProcessInfo  `json:"process_info"`
	Children    []*ProcessTree `json:"children"`
}

// GetProcesses 获取进程列表
func GetProcesses(sortBy string, order string, limit int) ([]ProcessInfo, error) {
	pids, err := process.Pids()
	if err != nil {
		return nil, fmt.Errorf("failed to get process list: %w", err)
	}

	var processes []ProcessInfo

	for _, pid := range pids {
		procInfo, err := getProcessInfo(pid)
		if err != nil {
			// 跳过无法访问的进程
			continue
		}

		processes = append(processes, *procInfo)
	}

	// 排序
	sortProcesses(processes, sortBy, order)

	// 限制数量
	if limit > 0 && len(processes) > limit {
		processes = processes[:limit]
	}

	return processes, nil
}

// getProcessInfo 获取单个进程信息
func getProcessInfo(pid int32) (*ProcessInfo, error) {
	p, err := process.NewProcess(pid)
	if err != nil {
		return nil, err
	}

	// 基本信息
	name, _ := p.Name()
	statusRaw, _ := p.Status()
	status := ""
	if len(statusRaw) > 0 {
		status = statusRaw[0]
	}
	ppid, _ := p.Ppid()
	// pgid, _ := p.Pgid() // gopsutil可能不支持此字段
	numThreads, _ := p.NumThreads()

    // 内存信息（在 Windows 上可能返回 nil，需防护）
    memInfo, _ := p.MemoryInfo()
    memPercent, _ := p.MemoryPercent()

    var memRSS uint64
    var memVMS uint64
    if memInfo != nil {
        memRSS = memInfo.RSS
        memVMS = memInfo.VMS
    }

    // CPU信息（Times 在不同平台的字段支持差异较大，需防护）
    cpuPercent, _ := p.CPUPercent()
    times, _ := p.Times()
    var processTimes ProcessTimes
    if times != nil {
        processTimes = ProcessTimes{
            User:    times.User,
            System:  times.System,
            Idle:    times.Idle,
            Nice:    times.Nice,
            Iowait:  times.Iowait,
            Irq:     times.Irq,
            Softirq: times.Softirq,
            Steal:   times.Steal,
            Guest:   times.Guest,
        }
    } else {
        processTimes = ProcessTimes{}
    }

	// 时间信息
	createTime, _ := p.CreateTime()

	// 路径信息
	cwd, _ := p.Cwd()
	exe, _ := p.Exe()
	cmdlineRaw, _ := p.Cmdline()
	var cmdline string
	if len(cmdlineRaw) > 0 {
		cmdline = cmdlineRaw
	}

	// 用户信息
	username, _ := p.Username()

	// 子进程
	children, _ := p.Children()
	var childPids []int32
	for _, child := range children {
		childPids = append(childPids, child.Pid)
	}

	// 构建进程信息
	procInfo := &ProcessInfo{
		PID:        pid,
		Name:       name,
		Status:     status,
		PPID:       ppid,
		Pgid:       0, // pgid暂时设为0
		NumThreads: numThreads,
		MemUsage:   memPercent,
        MemRSS:     memRSS,
        MemVMS:     memVMS,
		CPUPercent: cpuPercent,
		Times:      processTimes,
		CreateTime: createTime,
		Cwd:        cwd,
		Exe:        exe,
		Cmdline:    cmdline,
		Username:   username,
		Children:   childPids,
		Timestamp:  time.Now(),
	}

	// 设置父进程
	if ppid > 0 {
		procInfo.Parent = &ppid
	}

	return procInfo, nil
}

// GetProcessByPID 根据PID获取进程信息
func GetProcessByPID(pid int32) (*ProcessInfo, error) {
	return getProcessInfo(pid)
}

// GetProcessTree 获取进程树
func GetProcessTree() (*ProcessTree, error) {
	processes, err := GetProcesses("", "", 0)
	if err != nil {
		return nil, err
	}

	// 创建进程映射
	processMap := make(map[int32]*ProcessInfo)
	for i := range processes {
		processMap[processes[i].PID] = &processes[i]
	}

	// 构建树结构
	var roots []*ProcessTree
	for _, proc := range processes {
		treeNode := &ProcessTree{
			ProcessInfo: &proc,
			Children:    make([]*ProcessTree, 0),
		}

		if proc.Parent == nil || *proc.Parent == 0 {
			// 根进程
			roots = append(roots, treeNode)
		} else {
			// 子进程，添加到父进程的children中
			if parent, exists := processMap[*proc.Parent]; exists {
			_ = parent // 使用parent避免编译器警告
				// 找到父进程的树节点
				for _, root := range roots {
					parentNode := findTreeNode(root, *proc.Parent)
					if parentNode != nil {
						parentNode.Children = append(parentNode.Children, treeNode)
						break
					}
				}
			}
		}
	}

	// 返回第一个根进程（通常是init进程或systemd）
	if len(roots) > 0 {
		return roots[0], nil
	}

	return nil, fmt.Errorf("no root process found")
}

// findTreeNode 在树中查找指定PID的节点
func findTreeNode(node *ProcessTree, pid int32) *ProcessTree {
	if node.ProcessInfo.PID == pid {
		return node
	}

	for _, child := range node.Children {
		if found := findTreeNode(child, pid); found != nil {
			return found
		}
	}

	return nil
}

// KillProcess 终止进程
func KillProcess(pid int32) error {
	p, err := process.NewProcess(pid)
	if err != nil {
		return fmt.Errorf("failed to find process %d: %w", pid, err)
	}

	return p.Kill()
}

// SuspendProcess 暂停进程
func SuspendProcess(pid int32) error {
	p, err := process.NewProcess(pid)
	if err != nil {
		return fmt.Errorf("failed to find process %d: %w", pid, err)
	}

	return p.Suspend()
}

// ResumeProcess 恢复进程
func ResumeProcess(pid int32) error {
	p, err := process.NewProcess(pid)
	if err != nil {
		return fmt.Errorf("failed to find process %d: %w", pid, err)
	}

	return p.Resume()
}

// GetTopProcesses 获取资源使用最高的进程
func GetTopProcesses(by string, limit int) ([]ProcessInfo, error) {
	sortBy := by
	if sortBy == "" {
		sortBy = "cpu"
	}

	return GetProcesses(sortBy, "desc", limit)
}

// FilterProcesses 过滤进程
func FilterProcesses(processes []ProcessInfo, filter string) []ProcessInfo {
	if filter == "" {
		return processes
	}

	filter = strings.ToLower(filter)
	var filtered []ProcessInfo

	for _, proc := range processes {
		if strings.Contains(strings.ToLower(proc.Name), filter) ||
			strings.Contains(strings.ToLower(proc.Cmdline), filter) ||
			strings.Contains(strings.ToLower(proc.Username), filter) {
			filtered = append(filtered, proc)
		}
	}

	return filtered
}

// GetProcessStatistics 获取进程统计信息
func GetProcessStatistics() (map[string]interface{}, error) {
	processes, err := GetProcesses("", "", 0)
	if err != nil {
		return nil, err
	}

	totalProcesses := len(processes)
	var totalMemory uint64
	var totalCPU float64
	var running, sleeping, zombie, stopped int

	statusCount := make(map[string]int)

	for _, proc := range processes {
		totalMemory += proc.MemRSS
		totalCPU += proc.CPUPercent

		status := strings.ToLower(proc.Status)
		statusCount[status]++

		switch status {
		case "running":
			running++
		case "sleeping":
			sleeping++
		case "zombie":
			zombie++
		case "stopped":
			stopped++
		}
	}

	// 按用户统计
	userCount := make(map[string]int)
	for _, proc := range processes {
		userCount[proc.Username]++
	}

	// 按状态统计
	statusStats := make(map[string]interface{})
	for status, count := range statusCount {
		statusStats[status] = count
	}

	return map[string]interface{}{
		"total_processes": totalProcesses,
		"running":         running,
		"sleeping":        sleeping,
		"zombie":          zombie,
		"stopped":         stopped,
		"total_memory":    totalMemory,
		"total_cpu":       totalCPU,
		"status_stats":    statusStats,
		"user_stats":      userCount,
		"timestamp":       time.Now(),
	}, nil
}

// sortProcesses 排序进程列表
func sortProcesses(processes []ProcessInfo, sortBy string, order string) {
	if sortBy == "" {
		sortBy = "cpu"
	}
	if order == "" {
		order = "desc"
	}

	reverse := order == "desc"

	switch sortBy {
	case "pid":
		sort.Slice(processes, func(i, j int) bool {
			if reverse {
				return processes[i].PID > processes[j].PID
			}
			return processes[i].PID < processes[j].PID
		})
	case "name":
		sort.Slice(processes, func(i, j int) bool {
			if reverse {
				return processes[i].Name > processes[j].Name
			}
			return processes[i].Name < processes[j].Name
		})
	case "cpu":
		sort.Slice(processes, func(i, j int) bool {
			if reverse {
				return processes[i].CPUPercent > processes[j].CPUPercent
			}
			return processes[i].CPUPercent < processes[j].CPUPercent
		})
	case "memory":
		sort.Slice(processes, func(i, j int) bool {
			if reverse {
				return processes[i].MemUsage > processes[j].MemUsage
			}
			return processes[i].MemUsage < processes[j].MemUsage
		})
	case "threads":
		sort.Slice(processes, func(i, j int) bool {
			if reverse {
				return processes[i].NumThreads > processes[j].NumThreads
			}
			return processes[i].NumThreads < processes[j].NumThreads
		})
	case "time":
		sort.Slice(processes, func(i, j int) bool {
			if reverse {
				return processes[i].CreateTime > processes[j].CreateTime
			}
			return processes[i].CreateTime < processes[j].CreateTime
		})
	default:
		// 默认按CPU排序
		sort.Slice(processes, func(i, j int) bool {
			if reverse {
				return processes[i].CPUPercent > processes[j].CPUPercent
			}
			return processes[i].CPUPercent < processes[j].CPUPercent
		})
	}
}