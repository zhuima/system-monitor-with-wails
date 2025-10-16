package models

import (
    "bufio"
    "errors"
    "fmt"
    "os"
    "os/exec"
    "path/filepath"
    "runtime"
    "strings"
    "time"

    cpuinfo "github.com/shirou/gopsutil/v3/cpu"
    meminfo "github.com/shirou/gopsutil/v3/mem"
    diskinfo "github.com/shirou/gopsutil/v3/disk"
    netinfo "github.com/shirou/gopsutil/v3/net"

    // 轻量级跨平台硬件信息库
    "github.com/jaypipes/ghw"
)

// Component 通用硬件组件描述
type Component struct {
    Vendor   string            `json:"vendor"`
    Model    string            `json:"model"`
    Version  string            `json:"version,omitempty"`
    Details  map[string]string `json:"details,omitempty"`
}

// MemoryModule 物理内存条信息
type MemoryModule struct {
    Vendor    string `json:"vendor"`
    Model     string `json:"model"`
    SizeBytes uint64 `json:"size_bytes"`
    ClockMHz  int    `json:"clock_mhz"`
    Type      string `json:"type,omitempty"`
}

// MemorySummary 内存汇总
type MemorySummary struct {
    TotalBytes uint64         `json:"total_bytes"`
    Modules    []MemoryModule `json:"modules,omitempty"`
    Type       string         `json:"type,omitempty"`
    ClockMHz   int            `json:"clock_mhz,omitempty"`
}

// DiskModel 主硬盘信息
type DiskModel struct {
    Vendor    string `json:"vendor"`
    Model     string `json:"model"`
    Serial    string `json:"serial,omitempty"`
    SizeBytes uint64 `json:"size_bytes"`
    Type      string `json:"type,omitempty"` // HDD/SSD/NVMe
}

// DisplayInfo 显示器信息（尽量跨平台）
type DisplayInfo struct {
    Vendor      string `json:"vendor"`
    Model       string `json:"model"`
    Resolution  string `json:"resolution,omitempty"`
    RefreshRate int    `json:"refresh_rate,omitempty"`
}

// BatteryInfo 电池信息
type BatteryInfo struct {
    Present    bool   `json:"present"`
    Percentage int    `json:"percentage,omitempty"`
    Status     string `json:"status,omitempty"`
    Health     string `json:"health,omitempty"`
    Vendor     string `json:"vendor,omitempty"`
    Model      string `json:"model,omitempty"`
}

// HardwareInfo 总的硬件参数信息
type HardwareInfo struct {
    Processor    Component    `json:"processor"`
    Memory       MemorySummary `json:"memory"`
    GPU          Component    `json:"gpu"`
    Motherboard  Component    `json:"motherboard"`
    Display      DisplayInfo  `json:"display"`
    PrimaryDisk  DiskModel    `json:"primary_disk"`
    NIC          Component    `json:"nic"`
    Battery      BatteryInfo  `json:"battery"`
    Audio        Component    `json:"audio"`
    Timestamp    time.Time    `json:"timestamp"`
}

// NewHardwareInfo 采集并构建硬件参数信息（尽量跨平台）
func NewHardwareInfo() (*HardwareInfo, error) {
    // CPU
    cpuComp := Component{}
    if infos, err := cpuinfo.Info(); err == nil && len(infos) > 0 {
        main := infos[0]
        cpuComp = Component{
            Vendor: main.VendorID,
            Model:  main.ModelName,
            Version: fmt.Sprintf("%s", main.Family),
            Details: map[string]string{
                "cores": fmt.Sprintf("%d", main.Cores),
                "mhz":   fmt.Sprintf("%.0f", main.Mhz),
            },
        }
    }

    // Memory
    memSum := MemorySummary{}
    if vm, err := meminfo.VirtualMemory(); err == nil {
        memSum.TotalBytes = vm.Total
    }
    // 使用 ghw.Memory() 提供的聚合信息，但避免访问在不同平台/版本可能不存在的字段
    if mem, err := ghw.Memory(); err == nil && mem != nil {
        // 优先使用 ghw 的物理内存总量（若 gopsutil 未取到或为 0）
        if memSum.TotalBytes == 0 && mem.TotalPhysicalBytes > 0 {
            memSum.TotalBytes = uint64(mem.TotalPhysicalBytes)
        }
        // 尝试采集模块级信息（型号+容量），按平台尽力而为
        mods := detectMemoryModules()
        if len(mods) > 0 {
            memSum.Modules = mods
            // 从第一条内存条推断类型/频率（若可用）
            if memSum.Type == "" {
                memSum.Type = mods[0].Type
            }
            if memSum.ClockMHz == 0 {
                memSum.ClockMHz = mods[0].ClockMHz
            }
        }
    }

    // GPU
    gpuComp := Component{}
    if gi, err := ghw.GPU(); err == nil && gi != nil {
        if len(gi.GraphicsCards) > 0 {
            card := gi.GraphicsCards[0]
            vendor := ""
            product := ""
            if card.DeviceInfo != nil {
                if card.DeviceInfo.Vendor != nil {
                    vendor = card.DeviceInfo.Vendor.Name
                }
                if card.DeviceInfo.Product != nil {
                    product = card.DeviceInfo.Product.Name
                }
            }
            gpuComp = Component{Vendor: vendor, Model: product}
        }
    }

    // Motherboard / Baseboard
    mbComp := Component{}
    if bb, err := ghw.Baseboard(); err == nil && bb != nil {
        mbComp = Component{Vendor: bb.Vendor, Model: bb.Product, Version: bb.Version}
    }

    // Primary Disk
    diskModel := DiskModel{}
    rootMount := "/"
    if runtime.GOOS == "windows" {
        rootMount = "C:\\" // 典型主系统盘
    }
    if parts, err := diskinfo.Partitions(false); err == nil {
        rootDev := ""
        for _, p := range parts {
            if p.Mountpoint == rootMount || (runtime.GOOS == "windows" && strings.HasSuffix(strings.ToUpper(p.Mountpoint), ":\\")) {
                rootDev = p.Device
                break
            }
        }
        if bi, err := ghw.Block(); err == nil && bi != nil {
            for _, d := range bi.Disks {
                if rootDev != "" && (strings.Contains(rootDev, d.Name) || strings.Contains(rootDev, d.SerialNumber)) {
                    diskModel = DiskModel{
                        Vendor:    d.Vendor,
                        Model:     d.Model,
                        Serial:    d.SerialNumber,
                        SizeBytes: d.SizeBytes,
                        Type:      string(d.DriveType),
                    }
                    break
                }
            }
            if diskModel.Model == "" && len(bi.Disks) > 0 {
                d := bi.Disks[0]
                diskModel = DiskModel{
                    Vendor:    d.Vendor,
                    Model:     d.Model,
                    Serial:    d.SerialNumber,
                    SizeBytes: d.SizeBytes,
                    Type:      string(d.DriveType),
                }
            }
        }
    }

    // NIC
    nicComp := Component{}
    if ni, err := ghw.Network(); err == nil && ni != nil && len(ni.NICs) > 0 {
        // 选择有 MAC 的网卡（避免使用在不同版本可能不存在的 IsUp 字段）
        chosen := ni.NICs[0]
        for _, c := range ni.NICs {
            if c.MacAddress != "" {
                chosen = c
                break
            }
        }
        // 厂商/产品信息在 ghw 的 NIC 结构中可能不可用，使用名称和 MAC 保持跨平台兼容
        nicComp = Component{Vendor: "", Model: chosen.Name, Details: map[string]string{"mac": chosen.MacAddress}}
    } else {
        // 作为补充，使用 gopsutil 统计最活跃接口
        if stats, err := netinfo.IOCounters(true); err == nil && len(stats) > 0 {
            s := stats[0]
            nicComp = Component{Model: s.Name, Details: map[string]string{"bytes_recv": fmt.Sprintf("%d", s.BytesRecv), "bytes_sent": fmt.Sprintf("%d", s.BytesSent)}}
        }
    }

    // Display（OS 特定，尽力而为）
    disp := detectDisplay()

    // Battery（OS 特定）
    batt := detectBattery()

    // Audio（OS 特定）
    audio := detectAudio()

    return &HardwareInfo{
        Processor:   cpuComp,
        Memory:      memSum,
        GPU:         gpuComp,
        Motherboard: mbComp,
        Display:     disp,
        PrimaryDisk: diskModel,
        NIC:         nicComp,
        Battery:     batt,
        Audio:       audio,
        Timestamp:   time.Now(),
    }, nil
}

// detectDisplay 尽力获取显示器信息
func detectDisplay() DisplayInfo {
    switch runtime.GOOS {
    case "windows":
        // 尝试通过 wmic 命令（避免直接引入 WMI 依赖）
        // wmic path Win32_VideoController get Name,CurrentHorizontalResolution,CurrentVerticalResolution /format:value
        out, err := exec.Command("cmd", "/C", "wmic path Win32_VideoController get Name,CurrentHorizontalResolution,CurrentVerticalResolution /format:value").Output()
        if err == nil {
            text := string(out)
            name := matchKV(text, "Name")
            w := matchKV(text, "CurrentHorizontalResolution")
            h := matchKV(text, "CurrentVerticalResolution")
            res := ""
            if w != "" && h != "" {
                res = fmt.Sprintf("%sx%s", w, h)
            }
            return DisplayInfo{Vendor: "", Model: name, Resolution: res}
        }
        return DisplayInfo{}
    case "darwin":
        // system_profiler SPDisplaysDataType
        out, err := exec.Command("bash", "-lc", "system_profiler SPDisplaysDataType | grep -E 'Resolution|Display Type|Vendor|Model' -n").Output()
        if err == nil {
            scanner := bufio.NewScanner(strings.NewReader(string(out)))
            model := ""
            res := ""
            for scanner.Scan() {
                line := strings.TrimSpace(scanner.Text())
                if strings.Contains(line, "Resolution:") {
                    res = strings.TrimSpace(strings.TrimPrefix(line, "Resolution:"))
                }
                if strings.Contains(line, "Display Type:") {
                    if model == "" {
                        model = strings.TrimSpace(strings.TrimPrefix(line, "Display Type:"))
                    }
                }
            }
            return DisplayInfo{Model: model, Resolution: res}
        }
        return DisplayInfo{}
    default: // linux & others
        // 优先 xrandr
        out, err := exec.Command("bash", "-lc", "xrandr --current | grep '*' -m1").Output()
        if err == nil {
            line := strings.TrimSpace(string(out))
            // 例如: "1920x1080 60.00*+"
            parts := strings.Fields(line)
            model := "Primary"
            res := ""
            rate := 0
            if len(parts) > 0 {
                res = parts[0]
            }
            if len(parts) > 1 {
                // 去除尾部符号
                r := strings.TrimRight(parts[1], "+*")
                if v, err := parseInt(r); err == nil {
                    rate = v
                }
            }
            return DisplayInfo{Model: model, Resolution: res, RefreshRate: rate}
        }

        // 退化：从 /sys/class/drm 读取 EDID（仅返回占位）
        return DisplayInfo{}
    }
}

// detectBattery 获取电池信息
func detectBattery() BatteryInfo {
    switch runtime.GOOS {
    case "windows":
        out, err := exec.Command("cmd", "/C", "wmic path Win32_Battery get EstimatedChargeRemaining,BatteryStatus,Name,Manufacturer /format=value").Output()
        if err != nil {
            return BatteryInfo{Present: false}
        }
        perc := matchKV(string(out), "EstimatedChargeRemaining")
        status := matchKV(string(out), "BatteryStatus")
        manu := matchKV(string(out), "Manufacturer")
        name := matchKV(string(out), "Name")
        p := 0
        if v, err := parseInt(perc); err == nil { p = v }
        return BatteryInfo{Present: true, Percentage: p, Status: status, Vendor: manu, Model: name}
    case "darwin":
        out, err := exec.Command("bash", "-lc", "pmset -g batt | head -n1").Output()
        if err != nil { return BatteryInfo{Present: false} }
        line := string(out)
        // e.g., 'Now drawing from 'Battery Power'; -InternalBattery-0 (id=...)\t98%; ...'
        pct := extractPercent(line)
        manu := ""
        model := ""
        // 从 system_profiler 获取电池制造商与设备名（若可用）
        out2, err2 := exec.Command("bash", "-lc", "system_profiler SPPowerDataType | grep -E 'Manufacturer|Device Name|Model' -n").Output()
        if err2 == nil {
            scanner := bufio.NewScanner(strings.NewReader(string(out2)))
            for scanner.Scan() {
                l := strings.TrimSpace(scanner.Text())
                if strings.Contains(l, "Manufacturer:") {
                    manu = strings.TrimSpace(strings.TrimPrefix(l, "Manufacturer:"))
                }
                if model == "" && strings.Contains(l, "Device Name:") {
                    model = strings.TrimSpace(strings.TrimPrefix(l, "Device Name:"))
                }
                if model == "" && strings.Contains(l, "Model:") {
                    model = strings.TrimSpace(strings.TrimPrefix(l, "Model:"))
                }
            }
        }
        if manu == "" || model == "" {
            // 备用来源：ioreg AppleSmartBattery
            out3, err3 := exec.Command("bash", "-lc", "ioreg -rc AppleSmartBattery | egrep -i 'Manufacturer|Product' ").Output()
            if err3 == nil {
                scanner := bufio.NewScanner(strings.NewReader(string(out3)))
                for scanner.Scan() {
                    l := strings.TrimSpace(scanner.Text())
                    if manu == "" && strings.Contains(strings.ToLower(l), "manufacturer") {
                        parts := strings.Split(l, "=")
                        if len(parts) == 2 { manu = strings.Trim(strings.TrimSpace(parts[1]), "\" ") }
                    }
                    if model == "" && strings.Contains(strings.ToLower(l), "product") {
                        parts := strings.Split(l, "=")
                        if len(parts) == 2 { model = strings.Trim(strings.TrimSpace(parts[1]), "\" ") }
                    }
                }
            }
        }
        return BatteryInfo{Present: true, Percentage: pct, Vendor: manu, Model: model}
    default: // linux
        base := "/sys/class/power_supply"
        // 查找 BAT* 目录
        entries, err := os.ReadDir(base)
        if err != nil { return BatteryInfo{Present: false} }
        battDir := ""
        for _, e := range entries {
            if strings.HasPrefix(strings.ToLower(e.Name()), "bat") {
                battDir = filepath.Join(base, e.Name())
                break
            }
        }
        if battDir == "" { return BatteryInfo{Present: false} }
        pct := readInt(filepath.Join(battDir, "capacity"))
        status := readString(filepath.Join(battDir, "status"))
        vendor := readString(filepath.Join(battDir, "manufacturer"))
        model := readString(filepath.Join(battDir, "model_name"))
        if model == "" { model = readString(filepath.Join(battDir, "model")) }
        return BatteryInfo{Present: true, Percentage: pct, Status: status, Vendor: vendor, Model: model}
    }
}

// detectAudio 获取音频设备信息
func detectAudio() Component {
    switch runtime.GOOS {
    case "windows":
        out, err := exec.Command("cmd", "/C", "wmic path Win32_SoundDevice get Name,Manufacturer /format:value").Output()
        if err == nil {
            name := matchKV(string(out), "Name")
            manu := matchKV(string(out), "Manufacturer")
            return Component{Vendor: manu, Model: name}
        }
        return Component{}
    case "darwin":
        out, err := exec.Command("bash", "-lc", "system_profiler SPAudioDataType | grep -E 'Default Output Device|Input Device|Manufacturer|Model' -n").Output()
        if err == nil {
            scanner := bufio.NewScanner(strings.NewReader(string(out)))
            manu := ""
            model := ""
            for scanner.Scan() {
                line := strings.TrimSpace(scanner.Text())
                if strings.Contains(line, "Manufacturer:") {
                    manu = strings.TrimSpace(strings.TrimPrefix(line, "Manufacturer:"))
                }
                if strings.Contains(line, "Model:") {
                    model = strings.TrimSpace(strings.TrimPrefix(line, "Model:"))
                }
            }
            return Component{Vendor: manu, Model: model}
        }
        return Component{}
    default: // linux
        // 解析 /proc/asound/cards
        f, err := os.Open("/proc/asound/cards")
        if err != nil { return Component{} }
        defer f.Close()
        scanner := bufio.NewScanner(f)
        // 例如: " 0 [PCH            ]: HDA-Intel - HDA Intel PCH"
        for scanner.Scan() {
            line := strings.TrimSpace(scanner.Text())
            if line == "" { continue }
            parts := strings.Split(line, " - ")
            if len(parts) == 2 {
                model := strings.TrimSpace(parts[1])
                vendor := ""
                if strings.Contains(model, "-") {
                    p := strings.SplitN(model, "-", 2)
                    vendor = strings.TrimSpace(p[0])
                }
                return Component{Vendor: vendor, Model: model}
            }
        }
        return Component{}
    }
}

// detectMemoryModules 获取物理内存条（型号+容量等），按平台尽力而为
func detectMemoryModules() []MemoryModule {
    switch runtime.GOOS {
    case "windows":
        return detectMemoryModulesWindows()
    case "darwin":
        return detectMemoryModulesDarwin()
    default:
        return detectMemoryModulesLinux()
    }
}

// Windows: 使用 wmic 读取内存条信息
func detectMemoryModulesWindows() []MemoryModule {
    out, err := exec.Command("cmd", "/C", "wmic path Win32_PhysicalMemory get Manufacturer,PartNumber,Capacity,Speed /format=value").Output()
    if err != nil {
        return nil
    }
    scanner := bufio.NewScanner(strings.NewReader(string(out)))
    cur := map[string]string{}
    var mods []MemoryModule
    flush := func() {
        capStr := strings.TrimSpace(cur["Capacity"]) // bytes
        if capStr == "" { // 没容量不算有效条目
            return
        }
        capVal, _ := parseInt(capStr)
        m := MemoryModule{
            Vendor:    strings.TrimSpace(cur["Manufacturer"]),
            Model:     strings.TrimSpace(cur["PartNumber"]),
            SizeBytes: uint64(capVal),
        }
        if spd, ok := cur["Speed"]; ok {
            if v, err := parseInt(spd); err == nil {
                m.ClockMHz = v
            }
        }
        mods = append(mods, m)
    }
    for scanner.Scan() {
        line := strings.TrimSpace(scanner.Text())
        if line == "" { // 一条记录结束
            if len(cur) > 0 {
                flush()
                cur = map[string]string{}
            }
            continue
        }
        kv := strings.SplitN(line, "=", 2)
        if len(kv) == 2 {
            key := strings.TrimSpace(kv[0])
            val := strings.TrimSpace(kv[1])
            switch key {
            case "Manufacturer", "PartNumber", "Capacity", "Speed":
                cur[key] = val
            }
        }
    }
    // 最后一条（若未以空行结尾）
    if len(cur) > 0 {
        flush()
    }
    return mods
}

// macOS: 解析 system_profiler SPMemoryDataType
func detectMemoryModulesDarwin() []MemoryModule {
    out, err := exec.Command("bash", "-lc", "system_profiler SPMemoryDataType").Output()
    if err != nil {
        return nil
    }
    scanner := bufio.NewScanner(strings.NewReader(string(out)))
    var mods []MemoryModule
    cur := MemoryModule{}
    inBlock := false
    commit := func() {
        if cur.SizeBytes > 0 {
            mods = append(mods, cur)
        }
        cur = MemoryModule{}
    }
    for scanner.Scan() {
        line := strings.TrimSpace(scanner.Text())
        if line == "" { // 块分隔
            if inBlock {
                commit()
                inBlock = false
            }
            continue
        }
        // 块开始：BANK/DIMM 位置行
        if strings.HasSuffix(line, ":") && (strings.Contains(line, "BANK") || strings.Contains(line, "DIMM")) {
            if inBlock { // 先提交上一条
                commit()
            }
            inBlock = true
            continue
        }
        if strings.HasPrefix(line, "Size:") {
            val := strings.TrimSpace(strings.TrimPrefix(line, "Size:"))
            cur.SizeBytes = parseSizeBytes(val)
        } else if strings.HasPrefix(line, "Type:") {
            cur.Type = strings.TrimSpace(strings.TrimPrefix(line, "Type:"))
        } else if strings.HasPrefix(line, "Speed:") {
            spd := strings.TrimSpace(strings.TrimPrefix(line, "Speed:"))
            // e.g., "2400 MHz"
            spd = strings.TrimSuffix(spd, "MHz")
            v, _ := parseInt(spd)
            cur.ClockMHz = v
        } else if strings.HasPrefix(line, "Manufacturer:") {
            cur.Vendor = strings.TrimSpace(strings.TrimPrefix(line, "Manufacturer:"))
        } else if strings.HasPrefix(line, "Part Number:") {
            cur.Model = strings.TrimSpace(strings.TrimPrefix(line, "Part Number:"))
        }
    }
    // 末尾提交
    if inBlock {
        commit()
    }
    return mods
}

// Linux: 优先 dmidecode，其次 EDAC /sys 路径
func detectMemoryModulesLinux() []MemoryModule {
    // 1) dmidecode 解析（若可用）
    if out, err := exec.Command("bash", "-lc", "dmidecode -t memory").Output(); err == nil {
        mods := parseDmidecodeMemory(string(out))
        if len(mods) > 0 {
            return mods
        }
    }
    // 2) EDAC /sys/devices/system/edac/mc
    base := "/sys/devices/system/edac/mc"
    ctrls, err := os.ReadDir(base)
    if err != nil {
        return nil
    }
    var mods []MemoryModule
    for _, c := range ctrls {
        if !c.IsDir() || !strings.HasPrefix(c.Name(), "mc") {
            continue
        }
        mcdir := filepath.Join(base, c.Name())
        dimms, _ := os.ReadDir(mcdir)
        for _, d := range dimms {
            if !d.IsDir() || !strings.HasPrefix(d.Name(), "dimm") {
                // 兼容旧结构：csrow*/dimm*
                if d.IsDir() && strings.HasPrefix(d.Name(), "csrow") {
                    rowdir := filepath.Join(mcdir, d.Name())
                    sub, _ := os.ReadDir(rowdir)
                    for _, s := range sub {
                        if s.IsDir() && strings.HasPrefix(s.Name(), "dimm") {
                            dd := filepath.Join(rowdir, s.Name())
                            m := readEDACDimmdir(dd)
                            if m.SizeBytes > 0 {
                                mods = append(mods, m)
                            }
                        }
                    }
                }
                continue
            }
            dd := filepath.Join(mcdir, d.Name())
            m := readEDACDimmdir(dd)
            if m.SizeBytes > 0 {
                mods = append(mods, m)
            }
        }
    }
    return mods
}

func readEDACDimmdir(dd string) MemoryModule {
    // size: 8192 MB 或者数字
    sz := readString(filepath.Join(dd, "size"))
    label := readString(filepath.Join(dd, "dimm_label"))
    m := MemoryModule{Model: label}
    m.SizeBytes = parseSizeBytes(sz)
    return m
}

func parseDmidecodeMemory(text string) []MemoryModule {
    scanner := bufio.NewScanner(strings.NewReader(text))
    var mods []MemoryModule
    cur := MemoryModule{}
    inDevice := false
    commit := func() {
        // 过滤未安装的条目
        if cur.SizeBytes > 0 || cur.Model != "" || cur.Vendor != "" {
            mods = append(mods, cur)
        }
        cur = MemoryModule{}
    }
    for scanner.Scan() {
        line := strings.TrimSpace(scanner.Text())
        if strings.HasPrefix(line, "Memory Device") { // 新块
            if inDevice {
                commit()
            }
            inDevice = true
            continue
        }
        if !inDevice || line == "" {
            continue
        }
        if strings.HasPrefix(line, "Size:") {
            val := strings.TrimSpace(strings.TrimPrefix(line, "Size:"))
            // 跳过未安装
            if strings.Contains(strings.ToLower(val), "no module") {
                cur.SizeBytes = 0
            } else {
                cur.SizeBytes = parseSizeBytes(val)
            }
        } else if strings.HasPrefix(line, "Type:") {
            cur.Type = strings.TrimSpace(strings.TrimPrefix(line, "Type:"))
        } else if strings.HasPrefix(line, "Speed:") {
            spd := strings.TrimSpace(strings.TrimPrefix(line, "Speed:"))
            // 例如 "3466 MT/s" 或 "2400 MHz"
            for _, suf := range []string{"MT/s", "MHz"} {
                spd = strings.TrimSuffix(spd, suf)
            }
            v, _ := parseInt(spd)
            cur.ClockMHz = v
        } else if strings.HasPrefix(line, "Manufacturer:") {
            cur.Vendor = strings.TrimSpace(strings.TrimPrefix(line, "Manufacturer:"))
        } else if strings.HasPrefix(line, "Part Number:") {
            cur.Model = strings.TrimSpace(strings.TrimPrefix(line, "Part Number:"))
        }
    }
    if inDevice {
        commit()
    }
    // 只保留容量>0的条目，避免噪声
    filtered := make([]MemoryModule, 0, len(mods))
    for _, m := range mods {
        if m.SizeBytes > 0 {
            filtered = append(filtered, m)
        }
    }
    return filtered
}

// parseSizeBytes 将类似 "8192 MB"、"8 GB"、"16384" 的字符串解析为字节数
func parseSizeBytes(s string) uint64 {
    t := strings.TrimSpace(s)
    if t == "" {
        return 0
    }
    // 统一大写便于判断单位
    u := strings.ToUpper(t)
    // 先提取数字部分
    num := ""
    for _, ch := range u {
        if ch >= '0' && ch <= '9' {
            num += string(ch)
        } else if num != "" {
            // 已开始数字且遇到非数字，停止提取
            break
        }
    }
    n, err := parseInt(num)
    if err != nil {
        return 0
    }
    // 单位判断
    if strings.Contains(u, "GB") {
        return uint64(n) * 1024 * 1024 * 1024
    }
    if strings.Contains(u, "MB") {
        return uint64(n) * 1024 * 1024
    }
    if strings.Contains(u, "KB") {
        return uint64(n) * 1024
    }
    // 若无单位，可能是字节或 MB。优先按字节处理（Windows wmic Capacity 为字节）
    return uint64(n)
}

// --- 辅助函数 ---

func matchKV(text, key string) string {
    // 解析 WMIC 返回的 key=value 行
    for _, line := range strings.Split(text, "\n") {
        line = strings.TrimSpace(line)
        if strings.HasPrefix(strings.ToLower(line), strings.ToLower(key)+"=") {
            return strings.TrimSpace(strings.SplitN(line, "=", 2)[1])
        }
    }
    return ""
}

func extractPercent(s string) int {
    // 查找类似 "98%" 的百分比
    idx := strings.Index(s, "%")
    if idx <= 0 { return 0 }
    // 回溯数字
    num := ""
    for i := idx-1; i >= 0; i-- {
        if s[i] < '0' || s[i] > '9' { break }
        num = string(s[i]) + num
    }
    v, _ := parseInt(num)
    return v
}

func parseInt(s string) (int, error) {
    s = strings.TrimSpace(s)
    if s == "" { return 0, errors.New("empty") }
    var v int
    for _, ch := range s {
        if ch < '0' || ch > '9' { return 0, errors.New("not int") }
        v = v*10 + int(ch-'0')
    }
    return v, nil
}

func readInt(p string) int {
    b, err := os.ReadFile(p)
    if err != nil { return 0 }
    v, _ := parseInt(string(b))
    return v
}

func readString(p string) string {
    b, err := os.ReadFile(p)
    if err != nil { return "" }
    return strings.TrimSpace(string(b))
}