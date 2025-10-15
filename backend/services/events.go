package services

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// EventManager 事件管理器
type EventManager struct {
	ctx context.Context
}

// NewEventManager 创建新的事件管理器
func NewEventManager(ctx context.Context) *EventManager {
	return &EventManager{
		ctx: ctx,
	}
}

// Emit 发送事件
func (em *EventManager) Emit(eventName string, data interface{}) {
	runtime.EventsEmit(em.ctx, eventName, data)
}

// EmitSystemData 发送系统数据事件
func (em *EventManager) EmitSystemData(data interface{}) {
	em.Emit("system-data", data)
}

// EmitAlert 发送告警事件
func (em *EventManager) EmitAlert(alert interface{}) {
	em.Emit("alert", alert)
}

// EmitAlertResolved 发送告警解决事件
func (em *EventManager) EmitAlertResolved(alert interface{}) {
	em.Emit("alert-resolved", alert)
}

// EmitError 发送错误事件
func (em *EventManager) EmitError(err error) {
	em.Emit("error", map[string]interface{}{
		"message": err.Error(),
	})
}

// EmitAppReady 发送应用就绪事件
func (em *EventManager) EmitAppReady(data interface{}) {
	em.Emit("app-ready", data)
}