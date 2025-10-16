import { SystemData, Config, AlertRule, Alert, ProcessInfo, HistoryQuery, HardwareInfo } from '@/types/system'

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

// 动态导入Wails API的辅助函数
async function callWailsAPI<T>(methodName: string, ...args: any[]): Promise<T> {
  try {
    // 动态导入Wails生成的API
    const mod = await import('../../wailsjs/go/main/App')
    // 兼容可能的默认导出或命名导出差异
    const method = (mod as any)[methodName] || ((mod as any).default && (mod as any).default[methodName])
    if (!method) {
      throw new Error(`方法 ${methodName} 不存在`)
    }
    return await method(...args)
  } catch (error) {
    console.error(`调用 ${methodName} 失败:`, error)
    throw error
  }
}

// 系统数据 API
export const systemAPI = {
  // 获取当前系统数据
  async getCurrentData(): Promise<APIResponse<SystemData>> {
    return apiCall(() => callWailsAPI('GetSystemData'))
  },

  // 获取系统基本信息
  async getSystemInfo(): Promise<APIResponse<any>> {
    return apiCall(() => callWailsAPI('GetSystemInfo'))
  },

  // 获取历史数据
  async getHistoryData(query: HistoryQuery): Promise<APIResponse<any>> {
    return apiCall(() => callWailsAPI('GetHistoryData', query.metric, query.duration))
  },

  // 新增：获取硬件参数信息
  async getHardwareInfo(): Promise<APIResponse<HardwareInfo>> {
    return apiCall(() => callWailsAPI('GetHardwareInfo'))
  },
}

// 进程管理 API
export const processAPI = {
  // 获取进程列表
  async getProcesses(sortBy = 'cpu', order = 'desc', limit = 50): Promise<APIResponse<ProcessInfo[]>> {
    return apiCall(() => callWailsAPI('GetProcesses', sortBy, order, limit))
  },

  // 终止进程
  async killProcess(pid: number): Promise<APIResponse<void>> {
    return apiCall(() => callWailsAPI('KillProcess', pid))
  },
}

// 告警管理 API
export const alertAPI = {
  // 获取告警规则
  async getAlertRules(): Promise<APIResponse<AlertRule[]>> {
    return apiCall(() => callWailsAPI('GetAlertRules'))
  },

  // 创建告警规则
  async createAlertRule(rule: AlertRule): Promise<APIResponse<void>> {
    return apiCall(() => callWailsAPI('CreateAlertRule', rule))
  },

  // 更新告警规则
  async updateAlertRule(rule: AlertRule): Promise<APIResponse<void>> {
    return apiCall(() => callWailsAPI('UpdateAlertRule', rule))
  },

  // 删除告警规则
  async deleteAlertRule(id: number): Promise<APIResponse<void>> {
    return apiCall(() => callWailsAPI('DeleteAlertRule', id))
  },

  // 获取告警列表
  async getAlerts(limit = 50): Promise<APIResponse<Alert[]>> {
    return apiCall(() => callWailsAPI('GetAlerts', limit))
  },
}

// 配置管理 API
export const configAPI = {
  // 获取配置
  async getConfig(): Promise<APIResponse<Config>> {
    return apiCall(() => callWailsAPI('GetConfig'))
  },

  // 更新配置
  async updateConfig(config: Config): Promise<APIResponse<void>> {
    return apiCall(() => callWailsAPI('UpdateConfig', config))
  },
}

// 事件服务
export const eventService = {
  // 监听系统数据更新
  onSystemData(callback: (data: SystemData) => void) {
    try {
      // 动态导入事件监听
      import('../../wailsjs/runtime/runtime').then(({ EventsOn }) => {
        EventsOn('system-data', callback)
      }).catch(error => {
        console.warn('无法监听系统数据事件:', error)
      })
    } catch (error) {
      console.warn('事件监听初始化失败:', error)
    }
    
    // 返回取消监听的函数
    return () => {
      // 这里可以添加取消监听的逻辑
    }
  },

  // 监听告警事件
  onAlert(callback: (alert: Alert) => void) {
    try {
      import('../../wailsjs/runtime/runtime').then(({ EventsOn }) => {
        EventsOn('alert', callback)
      }).catch(error => {
        console.warn('无法监听告警事件:', error)
      })
    } catch (error) {
      console.warn('告警事件监听初始化失败:', error)
    }
    
    return () => {}
  },

  // 监听应用就绪事件
  onAppReady(callback: (data: any) => void) {
    try {
      import('../../wailsjs/runtime/runtime').then(({ EventsOn }) => {
        EventsOn('app-ready', callback)
      }).catch(error => {
        console.warn('无法监听应用就绪事件:', error)
      })
    } catch (error) {
      console.warn('应用就绪事件监听初始化失败:', error)
    }
    
    return () => {}
  },

  // 监听错误事件
  onError(callback: (error: any) => void) {
    try {
      import('../../wailsjs/runtime/runtime').then(({ EventsOn }) => {
        EventsOn('error', callback)
      }).catch(error => {
        console.warn('无法监听错误事件:', error)
      })
    } catch (error) {
      console.warn('错误事件监听初始化失败:', error)
    }
    
    return () => {}
  },
}

// 健康检查 API
export const healthAPI = {
  // 检查后端健康状态
  async checkHealth(): Promise<boolean> {
    try {
      const response = await systemAPI.getCurrentData()
      return response.success
    } catch (error) {
      return false
    }
  },

  // 获取应用状态
  async getAppStatus(): Promise<APIResponse<{ status: string; version: string }>> {
    return apiCall(async () => {
      const isHealthy = await this.checkHealth()
      return {
        status: isHealthy ? 'running' : 'error',
        version: '1.0.0',
      }
    })
  },
}

// 默认导出
export default {
  system: systemAPI,
  process: processAPI,
  alert: alertAPI,
  config: configAPI,
  health: healthAPI,
  events: eventService,
}