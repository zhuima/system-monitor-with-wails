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
      // 检查是否在开发环境（wailsjs文件不存在）
      if (import.meta.env.DEV) {
        console.log('开发环境：使用Mock API')
        const mockAPI = await import('./api-mock')
        wailsAPI = mockAPI
        return wailsAPI
      }

      // 尝试动态导入 Wails 生成的 Go 方法
      // 使用 eval 避免静态分析
      const wailsModule = eval('import("../wailsjs/go/main/App")')
      wailsAPI = await wailsModule
    } catch (error) {
      console.warn('无法加载Wails API，使用Mock数据:', error)
      // 降级到Mock API
      const mockAPI = await import('./api-mock')
      wailsAPI = mockAPI
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

// 错误处理
class APIError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'APIError'
  }
}

// 通用的 API 调用包装器
async function apiCall<T>(fn: () => Promise<T>): Promise<APIResponse<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    console.error('API call failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

// 系统数据 API
export const systemAPI = {
  // 获取当前系统数据
  async getCurrentData(): Promise<APIResponse<SystemData>> {
    const api = await getWailsAPI()
    return apiCall(() => api.GetSystemData())
  },

  // 获取系统基本信息
  async getSystemInfo(): Promise<APIResponse<any>> {
    const api = await getWailsAPI()
    return apiCall(() => api.GetSystemInfo())
  },

  // 获取历史数据
  async getHistoryData(query: HistoryQuery): Promise<APIResponse<any>> {
    const api = await getWailsAPI()
    return apiCall(() => api.GetHistoryData(query.metric, query.duration))
  },
}

// 进程管理 API
export const processAPI = {
  // 获取进程列表
  async getProcesses(sortBy = 'cpu', order = 'desc', limit = 50): Promise<APIResponse<ProcessInfo[]>> {
    const api = await getWailsAPI()
    return apiCall(() => api.GetProcesses(sortBy, order, limit))
  },

  // 终止进程
  async killProcess(pid: number): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return apiCall(() => api.KillProcess(pid))
  },
}

// 告警管理 API
export const alertAPI = {
  // 获取告警规则
  async getAlertRules(): Promise<APIResponse<AlertRule[]>> {
    const api = await getWailsAPI()
    return apiCall(() => api.GetAlertRules())
  },

  // 创建告警规则
  async createAlertRule(rule: AlertRule): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return apiCall(() => api.CreateAlertRule(rule))
  },

  // 更新告警规则
  async updateAlertRule(rule: AlertRule): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return apiCall(() => api.UpdateAlertRule(rule))
  },

  // 删除告警规则
  async deleteAlertRule(id: number): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return apiCall(() => api.DeleteAlertRule(id))
  },

  // 获取告警列表
  async getAlerts(limit = 50): Promise<APIResponse<Alert[]>> {
    const api = await getWailsAPI()
    return apiCall(() => api.GetAlerts(limit))
  },
}

// 配置管理 API
export const configAPI = {
  // 获取配置
  async getConfig(): Promise<APIResponse<Config>> {
    const api = await getWailsAPI()
    return apiCall(() => api.GetConfig())
  },

  // 更新配置
  async updateConfig(config: Config): Promise<APIResponse<void>> {
    const api = await getWailsAPI()
    return apiCall(() => api.UpdateConfig(config))
  },
}

// 事件服务
export const eventService = {
  // 监听系统数据更新
  onSystemData(callback: (data: SystemData) => void) {
    if (import.meta.env.DEV) {
      console.log('开发环境：Mock事件监听')
      return
    }
    try {
      eval('import("../wailsjs/runtime").then(({ EventsOn }) => { EventsOn("system-data", callback) })')
    } catch (error) {
      console.warn('无法加载事件监听:', error)
    }
  },

  // 监听告警事件
  onAlert(callback: (alert: Alert) => void) {
    if (import.meta.env.DEV) {
      console.log('开发环境：Mock告警监听')
      return
    }
    try {
      eval('import("../wailsjs/runtime").then(({ EventsOn }) => { EventsOn("alert", callback) })')
    } catch (error) {
      console.warn('无法加载告警监听:', error)
    }
  },

  // 监听应用就绪事件
  onAppReady(callback: (data: any) => void) {
    if (import.meta.env.DEV) {
      console.log('开发环境：Mock应用就绪监听')
      return
    }
    try {
      eval('import("../wailsjs/runtime").then(({ EventsOn }) => { EventsOn("app-ready", callback) })')
    } catch (error) {
      console.warn('无法加载应用就绪监听:', error)
    }
  },

  // 监听错误事件
  onError(callback: (error: any) => void) {
    if (import.meta.env.DEV) {
      console.log('开发环境：Mock错误监听')
      return
    }
    try {
      eval('import("../wailsjs/runtime").then(({ EventsOn }) => { EventsOn("error", callback) })')
    } catch (error) {
      console.warn('无法加载错误监听:', error)
    }
  },
}

// 健康检查 API
export const healthAPI = {
  // 检查后端连接状态
  async checkHealth(): Promise<boolean> {
    try {
      const api = await getWailsAPI()
      await api.GetSystemInfo()
      return true
    } catch (error) {
      return false
    }
  },

  // 获取应用状态
  async getAppStatus(): Promise<APIResponse<{ status: string; version: string }>> {
    try {
      const api = await getWailsAPI()
      const systemInfo = await api.GetSystemInfo()
      return {
        success: true,
        data: {
          status: 'running',
          version: '1.0.0',
          systemInfo,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      }
    }
  },
}

// 导出默认 API
export default {
  system: systemAPI,
  process: processAPI,
  alert: alertAPI,
  config: configAPI,
  health: healthAPI,
  events: eventService,
}