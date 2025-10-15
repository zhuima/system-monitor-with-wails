package services

import (
	"database/sql"
	"fmt"
	"time"

	_ "modernc.org/sqlite"
)

// StorageService 数据存储服务
type StorageService struct {
	db *sql.DB
}

// NewStorageService 创建新的存储服务
func NewStorageService(dbPath string) (*StorageService, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	storage := &StorageService{
		db: db,
	}

	// 初始化数据库表
	if err := storage.initTables(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	return storage, nil
}

// initTables 初始化数据库表
func (s *StorageService) initTables() error {
	// CPU历史数据表
	if err := s.exec(`CREATE TABLE IF NOT EXISTS cpu_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp INTEGER NOT NULL,
		usage_percent REAL NOT NULL,
		load1 REAL NOT NULL,
		load5 REAL NOT NULL,
		load15 REAL NOT NULL,
		per_core TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return err
	}

	// 内存历史数据表
	if err := s.exec(`CREATE TABLE IF NOT EXISTS memory_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp INTEGER NOT NULL,
		used_percent REAL NOT NULL,
		swap_percent REAL NOT NULL,
		available INTEGER NOT NULL,
		free INTEGER NOT NULL,
		used INTEGER NOT NULL,
		swap_used INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return err
	}

	// 磁盘历史数据表
	if err := s.exec(`CREATE TABLE IF NOT EXISTS disk_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp INTEGER NOT NULL,
		device TEXT NOT NULL,
		mountpoint TEXT NOT NULL,
		used_percent REAL NOT NULL,
		free INTEGER NOT NULL,
		used INTEGER NOT NULL,
		read_bytes INTEGER NOT NULL,
		write_bytes INTEGER NOT NULL,
		read_time INTEGER NOT NULL,
		write_time INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return err
	}

	// 网络历史数据表
	if err := s.exec(`CREATE TABLE IF NOT EXISTS network_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp INTEGER NOT NULL,
		interface TEXT NOT NULL,
		bytes_sent INTEGER NOT NULL,
		bytes_recv INTEGER NOT NULL,
		packet_sent INTEGER NOT NULL,
		packet_recv INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return err
	}

	// 告警表
	if err := s.exec(`CREATE TABLE IF NOT EXISTS alerts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		rule_id INTEGER NOT NULL,
		rule_name TEXT NOT NULL,
		message TEXT NOT NULL,
		level TEXT NOT NULL,
		value REAL NOT NULL,
		threshold REAL NOT NULL,
		status TEXT NOT NULL DEFAULT 'active',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		resolved_at DATETIME
	)`); err != nil {
		return err
	}

	// 创建索引
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_cpu_history_timestamp ON cpu_history(timestamp)",
		"CREATE INDEX IF NOT EXISTS idx_memory_history_timestamp ON memory_history(timestamp)",
		"CREATE INDEX IF NOT EXISTS idx_disk_history_timestamp ON disk_history(timestamp)",
		"CREATE INDEX IF NOT EXISTS idx_network_history_timestamp ON network_history(timestamp)",
		"CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status)",
	}

	for _, idx := range indexes {
		if err := s.exec(idx); err != nil {
			return fmt.Errorf("failed to create index: %w", err)
		}
	}

	return nil
}

// exec 执行SQL语句
func (s *StorageService) exec(query string, args ...interface{}) error {
	stmt, err := s.db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(args...)
	return err
}

// StoreHistoryData 存储历史数据
func (s *StorageService) StoreHistoryData(data map[string]interface{}) error {
	timestamp := time.Now().Unix()

	// 存储CPU数据
	if cpuData, ok := data["cpu"]; ok {
		if err := s.storeCPUHistory(timestamp, cpuData); err != nil {
			return fmt.Errorf("failed to store CPU history: %w", err)
		}
	}

	// 存储内存数据
	if memData, ok := data["memory"]; ok {
		if err := s.storeMemoryHistory(timestamp, memData); err != nil {
			return fmt.Errorf("failed to store memory history: %w", err)
		}
	}

	// 存储磁盘数据
	if diskData, ok := data["disk"]; ok {
		if err := s.storeDiskHistory(timestamp, diskData); err != nil {
			return fmt.Errorf("failed to store disk history: %w", err)
		}
	}

	// 存储网络数据
	if netData, ok := data["network"]; ok {
		if err := s.storeNetworkHistory(timestamp, netData); err != nil {
			return fmt.Errorf("failed to store network history: %w", err)
		}
	}

	return nil
}

// storeCPUHistory 存储CPU历史数据
func (s *StorageService) storeCPUHistory(timestamp int64, data interface{}) error {
	// 这里需要根据实际的数据结构来解析
	// 暂时使用简单的实现
	return s.exec(`INSERT INTO cpu_history (timestamp, usage_percent, load1, load5, load15)
		VALUES (?, ?, ?, ?, ?)`,
		timestamp, 0.0, 0.0, 0.0, 0.0)
}

// storeMemoryHistory 存储内存历史数据
func (s *StorageService) storeMemoryHistory(timestamp int64, data interface{}) error {
	return s.exec(`INSERT INTO memory_history (timestamp, used_percent, swap_percent, available, free, used, swap_used)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		timestamp, 0.0, 0.0, 0, 0, 0, 0)
}

// storeDiskHistory 存储磁盘历史数据
func (s *StorageService) storeDiskHistory(timestamp int64, data interface{}) error {
	return s.exec(`INSERT INTO disk_history (timestamp, device, mountpoint, used_percent, free, used, read_bytes, write_bytes, read_time, write_time)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		timestamp, "", "", 0.0, 0, 0, 0, 0, 0, 0)
}

// storeNetworkHistory 存储网络历史数据
func (s *StorageService) storeNetworkHistory(timestamp int64, data interface{}) error {
	return s.exec(`INSERT INTO network_history (timestamp, interface, bytes_sent, bytes_recv, packet_sent, packet_recv)
		VALUES (?, ?, ?, ?, ?, ?)`,
		timestamp, "", 0, 0, 0, 0)
}

// GetHistoryData 获取历史数据
func (s *StorageService) GetHistoryData(metric string, duration int) (interface{}, error) {
	// 根据metric查询相应的历史数据
	switch metric {
	case "cpu":
		return s.getCPUHistory(duration)
	case "memory":
		return s.getMemoryHistory(duration)
	case "disk":
		return s.getDiskHistory(duration)
	case "network":
		return s.getNetworkHistory(duration)
	default:
		return nil, fmt.Errorf("unknown metric: %s", metric)
	}
}

// getCPUHistory 获取CPU历史数据
func (s *StorageService) getCPUHistory(duration int) ([]map[string]interface{}, error) {
	since := time.Now().Add(-time.Duration(duration) * time.Minute).Unix()

	rows, err := s.db.Query(`SELECT timestamp, usage_percent, load1, load5, load15
		FROM cpu_history WHERE timestamp >= ? ORDER BY timestamp ASC`, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var timestamp int64
		var usage, load1, load5, load15 float64

		if err := rows.Scan(&timestamp, &usage, &load1, &load5, &load15); err != nil {
			continue
		}

		results = append(results, map[string]interface{}{
			"timestamp":   time.Unix(timestamp, 0),
			"usage":       usage,
			"load1":       load1,
			"load5":       load5,
			"load15":      load15,
		})
	}

	return results, nil
}

// getMemoryHistory 获取内存历史数据
func (s *StorageService) getMemoryHistory(duration int) ([]map[string]interface{}, error) {
	since := time.Now().Add(-time.Duration(duration) * time.Minute).Unix()

	rows, err := s.db.Query(`SELECT timestamp, used_percent, swap_percent, available, free, used, swap_used
		FROM memory_history WHERE timestamp >= ? ORDER BY timestamp ASC`, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var timestamp int64
		var usedPercent, swapPercent float64
		var available, free, used, swapUsed uint64

		if err := rows.Scan(&timestamp, &usedPercent, &swapPercent, &available, &free, &used, &swapUsed); err != nil {
			continue
		}

		results = append(results, map[string]interface{}{
			"timestamp":    time.Unix(timestamp, 0),
			"used_percent": usedPercent,
			"swap_percent": swapPercent,
			"available":    available,
			"free":         free,
			"used":         used,
			"swap_used":    swapUsed,
		})
	}

	return results, nil
}

// getDiskHistory 获取磁盘历史数据
func (s *StorageService) getDiskHistory(duration int) ([]map[string]interface{}, error) {
	since := time.Now().Add(-time.Duration(duration) * time.Minute).Unix()

	rows, err := s.db.Query(`SELECT timestamp, device, mountpoint, used_percent, free, used, read_bytes, write_bytes, read_time, write_time
		FROM disk_history WHERE timestamp >= ? ORDER BY timestamp ASC`, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var timestamp int64
		var device, mountpoint string
		var usedPercent float64
		var free, used, readBytes, writeBytes, readTime, writeTime uint64

		if err := rows.Scan(&timestamp, &device, &mountpoint, &usedPercent, &free, &used, &readBytes, &writeBytes, &readTime, &writeTime); err != nil {
			continue
		}

		results = append(results, map[string]interface{}{
			"timestamp":   time.Unix(timestamp, 0),
			"device":      device,
			"mountpoint":  mountpoint,
			"used_percent": usedPercent,
			"free":        free,
			"used":        used,
			"read_bytes":  readBytes,
			"write_bytes": writeBytes,
			"read_time":   readTime,
			"write_time":  writeTime,
		})
	}

	return results, nil
}

// getNetworkHistory 获取网络历史数据
func (s *StorageService) getNetworkHistory(duration int) ([]map[string]interface{}, error) {
	since := time.Now().Add(-time.Duration(duration) * time.Minute).Unix()

	rows, err := s.db.Query(`SELECT timestamp, interface, bytes_sent, bytes_recv, packet_sent, packet_recv
		FROM network_history WHERE timestamp >= ? ORDER BY timestamp ASC`, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var timestamp int64
		var interfaceName string
		var bytesSent, bytesRecv, packetSent, packetRecv uint64

		if err := rows.Scan(&timestamp, &interfaceName, &bytesSent, &bytesRecv, &packetSent, &packetRecv); err != nil {
			continue
		}

		results = append(results, map[string]interface{}{
			"timestamp":   time.Unix(timestamp, 0),
			"interface":   interfaceName,
			"bytes_sent":  bytesSent,
			"bytes_recv":  bytesRecv,
			"packet_sent": packetSent,
			"packet_recv": packetRecv,
		})
	}

	return results, nil
}

// CleanupOldData 清理旧数据
func (s *StorageService) CleanupOldData(retentionDays int) error {
	cutoff := time.Now().AddDate(0, 0, -retentionDays).Unix()

	tables := []string{"cpu_history", "memory_history", "disk_history", "network_history"}

	for _, table := range tables {
		if err := s.exec(fmt.Sprintf("DELETE FROM %s WHERE timestamp < ?", table), cutoff); err != nil {
			return fmt.Errorf("failed to cleanup %s: %w", table, err)
		}
	}

	return nil
}

// Close 关闭数据库连接
func (s *StorageService) Close() error {
	if s.db != nil {
		return s.db.Close()
	}
	return nil
}