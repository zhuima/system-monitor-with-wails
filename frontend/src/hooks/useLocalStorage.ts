import { useState, useEffect } from 'react'

// 通用的 localStorage Hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 设置值到 localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许 value 是一个函数，类似于 useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // 删除值
  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}

// 主题 Hook
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'auto'>('theme', 'auto')

  // 应用主题到 DOM
  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // 自动主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [theme])

  return [theme, setTheme] as const
}

// 语言 Hook
export function useLanguage() {
  const [language, setLanguage] = useLocalStorage<string>('language', 'zh-CN')

  return [language, setLanguage] as const
}

// 侧边栏状态 Hook
export function useSidebarState() {
  const [isOpen, setIsOpen] = useLocalStorage<boolean>('sidebar-open', true)

  const toggle = () => setIsOpen(!isOpen)

  return [isOpen, setIsOpen, toggle] as const
}

// 刷新间隔 Hook
export function useRefreshInterval() {
  const [interval, setInterval] = useLocalStorage<number>('refresh-interval', 2000)

  const setIntervalWithValidation = (value: number) => {
    // 确保刷新间隔不小于 500ms 且不大于 60s
    const validValue = Math.max(500, Math.min(60000, value))
    setInterval(validValue)
  }

  return [interval, setIntervalWithValidation] as const
}

// 自动刷新 Hook
export function useAutoRefresh() {
  const [autoRefresh, setAutoRefresh] = useLocalStorage<boolean>('auto-refresh', true)

  return [autoRefresh, setAutoRefresh] as const
}

// 通知设置 Hook
export function useNotifications() {
  const [enabled, setEnabled] = useLocalStorage<boolean>('notifications-enabled', true)

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!enabled) return

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      })
    }
  }

  return [enabled, setEnabled, requestPermission, showNotification] as const
}

// 进程排序 Hook
export function useProcessSort() {
  const [sortBy, setSortBy] = useLocalStorage<string>('process-sort-by', 'cpu')
  const [sortOrder, setSortOrder] = useLocalStorage<'asc' | 'desc'>('process-sort-order', 'desc')

  const setSort = (field: string) => {
    if (sortBy === field) {
      // 如果点击相同的字段，切换排序方向
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc') // 默认降序
    }
  }

  return [sortBy, sortOrder, setSort] as const
}

// 图表设置 Hook
export function useChartSettings() {
  const [chartType, setChartType] = useLocalStorage<string>('chart-type', 'line')
  const [showGrid, setShowGrid] = useLocalStorage<boolean>('chart-show-grid', true)
  const [showLegend, setShowLegend] = useLocalStorage<boolean>('chart-show-legend', true)
  const [animationEnabled, setAnimationEnabled] = useLocalStorage<boolean>('chart-animation', true)

  return {
    chartType,
    setChartType,
    showGrid,
    setShowGrid,
    showLegend,
    setShowLegend,
    animationEnabled,
    setAnimationEnabled,
  } as const
}

// 用户偏好设置 Hook
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    showHiddenProcesses: false,
    showSystemProcesses: true,
    defaultView: 'dashboard',
    compactMode: false,
    highContrast: false,
  })

  const updatePreference = <K extends keyof typeof preferences>(
    key: K,
    value: typeof preferences[K]
  ) => {
    setPreferences({
      ...preferences,
      [key]: value,
    })
  }

  return [preferences, updatePreference] as const
}