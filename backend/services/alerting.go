package services

import (
	"fmt"
	"log"
	"time"

	"system-monitor/backend/models"
)

// AlertingService 告警服务
type AlertingService struct {
	config    interface{} // 实际应用中应该是具体的配置类型
	eventMgr  *EventManager
	rules     []models.AlertRule
	active    map[int64]*models.Alert
	alertChan chan *models.Alert
}

// NewAlertingService 创建新的告警服务
func NewAlertingService(config interface{}, eventMgr *EventManager) *AlertingService {
	return &AlertingService{
		config:    config,
		eventMgr:  eventMgr,
		rules:     make([]models.AlertRule, 0),
		active:    make(map[int64]*models.Alert),
		alertChan: make(chan *models.Alert, 100),
	}
}

// GetRules 获取告警规则
func (as *AlertingService) GetRules() ([]models.AlertRule, error) {
	return as.rules, nil
}

// CreateRule 创建告警规则
func (as *AlertingService) CreateRule(rule models.AlertRule) error {
	// 验证规则
	if err := as.validateRule(rule); err != nil {
		return fmt.Errorf("invalid rule: %w", err)
	}

	// 设置ID和创建时间
	rule.ID = time.Now().UnixNano()
	rule.CreatedAt = time.Now()
	rule.UpdatedAt = time.Now()

	as.rules = append(as.rules, rule)
	log.Printf("Created alert rule: %s", rule.Name)

	return nil
}

// UpdateRule 更新告警规则
func (as *AlertingService) UpdateRule(rule models.AlertRule) error {
	// 查找规则
	for i, r := range as.rules {
		if r.ID == rule.ID {
			// 验证规则
			if err := as.validateRule(rule); err != nil {
				return fmt.Errorf("invalid rule: %w", err)
			}

			rule.UpdatedAt = time.Now()
			as.rules[i] = rule
			log.Printf("Updated alert rule: %s", rule.Name)
			return nil
		}
	}

	return fmt.Errorf("rule with ID %d not found", rule.ID)
}

// DeleteRule 删除告警规则
func (as *AlertingService) DeleteRule(id int64) error {
	for i, rule := range as.rules {
		if rule.ID == id {
			as.rules = append(as.rules[:i], as.rules[i+1:]...)

			// 取消相关的活动告警
			if alert, exists := as.active[id]; exists {
				alert.Status = "resolved"
				alert.ResolvedAt = &[]time.Time{time.Now()}[0]
				as.eventMgr.EmitAlertResolved(alert)
				delete(as.active, id)
			}

			log.Printf("Deleted alert rule with ID: %d", id)
			return nil
		}
	}

	return fmt.Errorf("rule with ID %d not found", id)
}

// CheckAlerts 检查告警
func (as *AlertingService) CheckAlerts(data map[string]interface{}) error {
	for _, rule := range as.rules {
		if !rule.Enabled {
			continue
		}

		if err := as.evaluateRule(rule, data); err != nil {
			log.Printf("Error evaluating rule %s: %v", rule.Name, err)
		}
	}

	return nil
}

// evaluateRule 评估告警规则
func (as *AlertingService) evaluateRule(rule models.AlertRule, data map[string]interface{}) error {
	// 获取指标值
	value, err := as.getMetricValue(rule.Metric, data)
	if err != nil {
		return fmt.Errorf("failed to get metric value: %w", err)
	}

	// 评估条件
	isTriggered := as.evaluateCondition(value, rule.Operator, rule.Threshold)

	// 检查是否已有活动告警
	activeAlert, exists := as.active[rule.ID]

	if isTriggered && !exists {
		// 创建新告警
		alert := &models.Alert{
			ID:        time.Now().UnixNano(),
			RuleID:    rule.ID,
			RuleName:  rule.Name,
			Message:   as.formatAlertMessage(rule, value),
			Level:     rule.Actions[0].Level, // 使用第一个动作的级别
			Value:     value,
			Threshold: rule.Threshold,
			Status:    "active",
			CreatedAt: time.Now(),
		}

		as.active[rule.ID] = alert

		// 发送告警事件
		as.eventMgr.EmitAlert(alert)

		log.Printf("Alert triggered: %s (Value: %.2f, Threshold: %.2f)",
			rule.Name, value, rule.Threshold)

	} else if !isTriggered && exists {
		// 解决告警
		activeAlert.Status = "resolved"
		now := time.Now()
		activeAlert.ResolvedAt = &now

		// 发送告警解决事件
		as.eventMgr.EmitAlertResolved(activeAlert)

		delete(as.active, rule.ID)
		log.Printf("Alert resolved: %s", rule.Name)
	}

	return nil
}

// getMetricValue 获取指标值
func (as *AlertingService) getMetricValue(metric string, data map[string]interface{}) (float64, error) {
	switch metric {
	case "cpu":
		if cpuData, ok := data["cpu"]; ok {
			if cpuInfo, ok := cpuData.(*models.CPUInfo); ok {
				return cpuInfo.Usage, nil
			}
		}
	case "memory":
		if memData, ok := data["memory"]; ok {
			if memInfo, ok := memData.(*models.MemoryInfo); ok {
				return memInfo.UsedPercent, nil
			}
		}
	case "disk":
		if diskData, ok := data["disk"]; ok {
			if disks, ok := diskData.([]models.DiskInfo); ok && len(disks) > 0 {
				// 返回第一个磁盘的使用率
				return disks[0].UsedPercent, nil
			}
		}
	case "network":
		if netData, ok := data["network"]; ok {
			if nets, ok := netData.([]models.NetworkInfo); ok && len(nets) > 0 {
				// 返回第一个网络接口的流量总和
				total := nets[0].BytesSent + nets[0].BytesRecv
				return float64(total), nil
			}
		}
	case "processes":
		if procData, ok := data["processes"]; ok {
			if procs, ok := procData.([]models.ProcessInfo); ok {
				return float64(len(procs)), nil
			}
		}
	default:
		return 0, fmt.Errorf("unknown metric: %s", metric)
	}

	return 0, fmt.Errorf("metric data not found: %s", metric)
}

// evaluateCondition 评估条件
func (as *AlertingService) evaluateCondition(value float64, operator string, threshold float64) bool {
	switch operator {
	case ">":
		return value > threshold
	case ">=":
		return value >= threshold
	case "<":
		return value < threshold
	case "<=":
		return value <= threshold
	case "==":
		return value == threshold
	case "!=":
		return value != threshold
	default:
		return false
	}
}

// formatAlertMessage 格式化告警消息
func (as *AlertingService) formatAlertMessage(rule models.AlertRule, value float64) string {
	return fmt.Sprintf("%s: 当前值 %.2f %s 阈值 %.2f",
		rule.Name, value, as.getOperatorText(rule.Operator), rule.Threshold)
}

// getOperatorText 获取操作符文本
func (as *AlertingService) getOperatorText(operator string) string {
	switch operator {
	case ">":
		return "大于"
	case ">=":
		return "大于等于"
	case "<":
		return "小于"
	case "<=":
		return "小于等于"
	case "==":
		return "等于"
	case "!=":
		return "不等于"
	default:
		return operator
	}
}

// validateRule 验证规则
func (as *AlertingService) validateRule(rule models.AlertRule) error {
	if rule.Name == "" {
		return fmt.Errorf("rule name cannot be empty")
	}

	if rule.Metric == "" {
		return fmt.Errorf("metric cannot be empty")
	}

	if rule.Operator == "" {
		return fmt.Errorf("operator cannot be empty")
	}

	if rule.Threshold < 0 {
		return fmt.Errorf("threshold cannot be negative")
	}

	if rule.Duration < 0 {
		return fmt.Errorf("duration cannot be negative")
	}

	if len(rule.Actions) == 0 {
		return fmt.Errorf("at least one action is required")
	}

	return nil
}

// GetAlerts 获取告警列表
func (as *AlertingService) GetAlerts(limit int) ([]models.Alert, error) {
	var alerts []models.Alert

	// 添加活动告警
	for _, alert := range as.active {
		alerts = append(alerts, *alert)
	}

	// 这里应该从数据库获取历史告警，暂时返回空列表
	// TODO: 实现历史告警查询

	// 限制数量
	if limit > 0 && len(alerts) > limit {
		alerts = alerts[:limit]
	}

	return alerts, nil
}

// GetActiveAlerts 获取活动告警
func (as *AlertingService) GetActiveAlerts() []models.Alert {
	var alerts []models.Alert
	for _, alert := range as.active {
		alerts = append(alerts, *alert)
	}
	return alerts
}

// AcknowledgeAlert 确认告警
func (as *AlertingService) AcknowledgeAlert(alertID int64) error {
	// TODO: 实现告警确认功能
	log.Printf("Alert %d acknowledged", alertID)
	return nil
}

// SilenceAlert 静默告警
func (as *AlertingService) SilenceAlert(alertID int64, duration time.Duration) error {
	// TODO: 实现告警静默功能
	log.Printf("Alert %d silenced for %v", alertID, duration)
	return nil
}

// GetAlertStatistics 获取告警统计
func (as *AlertingService) GetAlertStatistics() (map[string]interface{}, error) {
	stats := map[string]interface{}{
		"total_rules":    len(as.rules),
		"active_rules":   0,
		"active_alerts":  len(as.active),
		"critical_alerts": 0,
		"warning_alerts":  0,
		"info_alerts":     0,
		"timestamp":       time.Now(),
	}

	// 统计活动规则
	for _, rule := range as.rules {
		if rule.Enabled {
			stats["active_rules"] = stats["active_rules"].(int) + 1
		}
	}

	// 统计告警级别
	for _, alert := range as.active {
		switch alert.Level {
		case "critical":
			stats["critical_alerts"] = stats["critical_alerts"].(int) + 1
		case "warning":
			stats["warning_alerts"] = stats["warning_alerts"].(int) + 1
		case "info":
			stats["info_alerts"] = stats["info_alerts"].(int) + 1
		}
	}

	return stats, nil
}

// CreateDefaultRules 创建默认告警规则
func (as *AlertingService) CreateDefaultRules() error {
	defaultRules := []models.AlertRule{
		{
			Name:      "CPU使用率过高",
			Metric:    "cpu",
			Operator:  ">",
			Threshold: 80.0,
			Duration:  5 * time.Minute,
			Enabled:   true,
			Actions: []models.AlertAction{
				{Type: "notification", Target: "desktop", Level: "warning"},
			},
		},
		{
			Name:      "内存使用率过高",
			Metric:    "memory",
			Operator:  ">",
			Threshold: 90.0,
			Duration:  5 * time.Minute,
			Enabled:   true,
			Actions: []models.AlertAction{
				{Type: "notification", Target: "desktop", Level: "warning"},
			},
		},
		{
			Name:      "磁盘空间不足",
			Metric:    "disk",
			Operator:  ">",
			Threshold: 95.0,
			Duration:  2 * time.Minute,
			Enabled:   true,
			Actions: []models.AlertAction{
				{Type: "notification", Target: "desktop", Level: "critical"},
			},
		},
	}

	for _, rule := range defaultRules {
		if err := as.CreateRule(rule); err != nil {
			log.Printf("Failed to create default rule %s: %v", rule.Name, err)
		}
	}

	return nil
}