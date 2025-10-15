// 生产环境API - 直接使用wailsjs
import { SystemData, Config, AlertRule, Alert, ProcessInfo, HistoryQuery } from '@/types/system'

// Wails API 调用接口
interface WailsAPI {
  GetSystemData(): Promise<SystemData>
  GetHistoryData(metric: string, duration: number): Promise<any>
  GetProcesses(sortBy: string, order: string, limit: number): Promise<ProcessInfo[]>
  KillProcess(pid: number): Promise<void>
  GetAlertRules(): Promise<AlertRule[]>
  CreateAlertRule(rule: AlertRule): Promise<void>
  UpdateAlertRule(rule: AlertRule): Promise<void>
  DeleteAlertRule(id: number): Promise<void>
  GetAlerts(limit: number): Promise<Alert[]>
  GetConfig(): Promise<Config>
  UpdateConfig(config: Config): Promise<void>
  GetSystemInfo(): Promise<any>
}

// 动态导入 Wails 生成的 API
let wailsAPI: WailsAPI | null = null

async function getWailsAPI(): Promise<WailsAPI> {
  if (!wailsAPI) {
    try {
      // 动态导入 Wails 生成的 Go 方法
      const { GetSystemData, GetHistoryData, GetProcesses, KillProcess } = await import('../wailsjs/go/main/App')
      const { GetAlertRules, CreateAlertRule, UpdateAlertRule, DeleteAlertRule, GetAlerts } = await import('../wailsjs/go/main/App')
      const { GetConfig, UpdateConfig, GetSystemInfo } = await import('../wailsjs/go/main/App')

      wailsAPI = {
        GetSystemData,
        GetHistoryData,
        GetProcesses,
        KillProcess,
        GetAlertRules,
        CreateAlertRule,
        UpdateAlertRule,
        DeleteAlertRule,
        GetAlerts,
        GetConfig,
        UpdateConfig,
        GetSystemInfo,
      }
    } catch (error) {
      console.error('无法加载Wails API:', error)
      throw new Error('无法连接到后端服务')
    }
  }
  return wailsAPI
}

// API 响应包装器
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 包装API调用以提供统一的错误处理
async function callAPI<T>(fn: () => Promise<T>): Promise<APIResponse<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    console.error('API调用失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 导出API函数
export const systemAPI = {
  // 获取系统数据
  async getSystemData(): Promise<APIResponse<SystemData>> {
    const api = await getWailsAPI()
    return callAPI(api.GetSystemData)
  },

  // 获取历史数据
  async getHistoryData(metric: string, duration: number): Promise<APIResponse<any>> {
    const api = await getWailsAPI()
    return callAPI(() => api.GetHistoryData(metric, duration))
  },

  // 获取进程列表
  async getProcesses(sortBy: string = 'cpu', order: string = 'desc', limit: number = 100): Promise<APIResponse<ProcessInfo[]>> {
    const api = await getWailsAPI()
    return callAPI(() => api.GetProcesses(sortBy, order, limit))
  },

  // 终止进程
  async killProcess(pid: number): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return callAPI(() => api.KillProcess(pid))
  },

  // 告警规则管理
  async getAlertRules(): Promise<APIResponse<AlertRule[]>> {
    const api = await getWailsAPI()
    return callAPI(api.GetAlertRules)
  },

  async createAlertRule(rule: AlertRule): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return callAPI(() => api.CreateAlertRule(rule))
  },

  async updateAlertRule(rule: AlertRule): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return callAPI(() => api.UpdateAlertRule(rule))
  },

  async deleteAlertRule(id: number): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return callAPI(() => api.DeleteAlertRule(id))
  },

  async getAlerts(limit: number = 50): Promise<APIResponse<Alert[]>> {
    const api = await getWailsAPI()
    return callAPI(() => api.GetAlerts(limit))
  },

  // 配置管理
  async getConfig(): Promise<APIResponse<Config>> {
    const api = await getWailsAPI()
    return callAPI(api.GetConfig)
  },

  async updateConfig(config: Config): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return callAPI(() => api.UpdateConfig(config))
  },

  // 系统信息
  async getSystemInfo(): Promise<APIResponse<any>> {
    const api = await getWailsAPI()
    return callAPI(api.GetSystemInfo)
  }
}

// 事件监听
export const events = {
  // 监听系统数据更新
  onSystemDataUpdate(callback: (data: SystemData) => void) {
    if (typeof window !== 'undefined' && (window as any).go) {
      // Wails runtime events
      return (window as any).runtime.EventsOn("system_data", callback)
    }
  },

  // 监听告警
  onAlert(callback: (alert: Alert) => void) {
    if (typeof window !== 'undefined' && (window as any).go) {
      return (window as any).runtime.EventsOn("alert", callback)
    }
  },

  // 监听告警解决
  onAlertResolved(callback: (alert: Alert) => void) {
    if (typeof window !== 'undefined' && (window as any).go) {
      return (window as any).runtime.EventsOn("alert_resolved", callback)
    }
  },

  // 监听应用就绪
  onAppReady(callback: (data: any) => void) {
    if (typeof window !== 'undefined' && (window as any).go) {
      return (window as any).runtime.EventsOn("app_ready", callback)
    }
  },

  // 监听错误
  onError(callback: (error: Error) => void) {
    if (typeof window !== 'undefined' && (window as any).go) {
      return (window as any).runtime.EventsOn("error", callback)
    }
  }
}