import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SystemData, Config, Alert, AlertRule } from '../types/system'

interface AppState {
  // 主题和UI状态
  theme: 'light' | 'dark' | 'auto'
  language: string
  sidebarOpen: boolean

  // 数据状态
  systemData: SystemData | null
  historyData: Record<string, any[]>
  alerts: Alert[]
  alertRules: AlertRule[]

  // 加载状态
  isLoading: boolean
  error: string | null

  // 配置
  config: Config | null

  // 设置状态
  refreshInterval: number
  autoRefresh: boolean
  showNotifications: boolean

  // 过滤和排序状态
  processesFilter: string
  processesSortBy: string
  processesSortOrder: 'asc' | 'desc'

  // 选中的数据
  selectedProcess: any | null
  selectedDisk: string | null
  selectedNetworkInterface: string | null
}

interface AppActions {
  // 主题和UI操作
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  setLanguage: (language: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // 数据操作
  setSystemData: (data: SystemData) => void
  setHistoryData: (metric: string, data: any[]) => void
  clearHistoryData: () => void
  addAlert: (alert: Alert) => void
  removeAlert: (id: number) => void
  updateAlertRule: (rule: AlertRule) => void

  // 加载状态操作
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // 配置操作
  setConfig: (config: Config) => void
  updateConfig: (updates: Partial<Config>) => void

  // 设置操作
  setRefreshInterval: (interval: number) => void
  setAutoRefresh: (autoRefresh: boolean) => void
  setShowNotifications: (show: boolean) => void

  // 过滤和排序操作
  setProcessesFilter: (filter: string) => void
  setProcessesSortBy: (sortBy: string) => void
  setProcessesSortOrder: (order: 'asc' | 'desc') => void

  // 选择操作
  setSelectedProcess: (process: any | null) => void
  setSelectedDisk: (disk: string | null) => void
  setSelectedNetworkInterface: (networkInterface: string | null) => void

  // 重置操作
  reset: () => void
}

type AppStore = AppState & AppActions

const initialState: AppState = {
  theme: 'auto',
  language: 'zh-CN',
  sidebarOpen: true,
  systemData: null,
  historyData: {},
  alerts: [],
  alertRules: [],
  isLoading: true,
  error: null,
  config: null,
  refreshInterval: 2000,
  autoRefresh: true,
  showNotifications: true,
  processesFilter: '',
  processesSortBy: 'cpu',
  processesSortOrder: 'desc',
  selectedProcess: null,
  selectedDisk: null,
  selectedNetworkInterface: null,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 主题和UI操作
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // 数据操作
      setSystemData: (systemData) => set({ systemData }),
      setHistoryData: (metric, data) =>
        set((state) => ({
          historyData: {
            ...state.historyData,
            [metric]: data,
          },
        })),
      clearHistoryData: () => set({ historyData: {} }),
      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts].slice(0, 100), // 保留最近100条告警
        })),
      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
        })),
      updateAlertRule: (rule) =>
        set((state) => ({
          alertRules: state.alertRules.map((r) => (r.id === rule.id ? rule : r)),
        })),

      // 加载状态操作
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // 配置操作
      setConfig: (config) => set({ config }),
      updateConfig: (updates) =>
        set((state) => ({
          config: state.config ? { ...state.config, ...updates } : null,
        })),

      // 设置操作
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setShowNotifications: (showNotifications) => set({ showNotifications }),

      // 过滤和排序操作
      setProcessesFilter: (processesFilter) => set({ processesFilter }),
      setProcessesSortBy: (processesSortBy) => set({ processesSortBy }),
      setProcessesSortOrder: (processesSortOrder) => set({ processesSortOrder }),

      // 选择操作
      setSelectedProcess: (selectedProcess) => set({ selectedProcess }),
      setSelectedDisk: (selectedDisk) => set({ selectedDisk }),
      setSelectedNetworkInterface: (selectedNetworkInterface) => set({ selectedNetworkInterface }),

      // 重置操作
      reset: () => set(initialState),
    }),
    {
      name: 'system-monitor-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarOpen: state.sidebarOpen,
        refreshInterval: state.refreshInterval,
        autoRefresh: state.autoRefresh,
        showNotifications: state.showNotifications,
        processesSortBy: state.processesSortBy,
        processesSortOrder: state.processesSortOrder,
      }),
    }
  )
)

// 选择器函数
export const useTheme = () => useAppStore((state) => state.theme)
export const useLanguage = () => useAppStore((state) => state.language)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)
export const useSystemData = () => useAppStore((state) => state.systemData)
export const useHistoryData = () => useAppStore((state) => state.historyData)
export const useAlerts = () => useAppStore((state) => state.alerts)
export const useAlertRules = () => useAppStore((state) => state.alertRules)
export const useLoading = () => useAppStore((state) => state.isLoading)
export const useError = () => useAppStore((state) => state.error)
export const useConfig = () => useAppStore((state) => state.config)
export const useRefreshInterval = () => useAppStore((state) => state.refreshInterval)
export const useAutoRefresh = () => useAppStore((state) => state.autoRefresh)
export const useShowNotifications = () => useAppStore((state) => state.showNotifications)
export const useProcessesFilter = () => useAppStore((state) => state.processesFilter)
export const useProcessesSortBy = () => useAppStore((state) => state.processesSortBy)
export const useProcessesSortOrder = () => useAppStore((state) => state.processesSortOrder)
export const useSelectedProcess = () => useAppStore((state) => state.selectedProcess)
export const useSelectedDisk = () => useAppStore((state) => state.selectedDisk)
export const useSelectedNetworkInterface = () => useAppStore((state) => state.selectedNetworkInterface)