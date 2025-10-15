import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { systemAPI, eventService } from '../services/api'
import { SystemData } from '../types/system'
import { useAppStore } from '../stores/appStore'

export function useSystemData() {
  const queryClient = useQueryClient()
  const { setSystemData, setLoading, setError, autoRefresh, refreshInterval } = useAppStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 获取系统数据的查询
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['system-data'],
    queryFn: async () => {
      const response = await systemAPI.getCurrentData()
      if (!response.success || !response.data) {
        throw new Error(response.error || '获取系统数据失败')
      }
      return response.data
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 1000, // 1秒内的数据被认为是新鲜的
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // 监听实时事件
  useEffect(() => {
    // 监听系统数据更新事件
    const unsubscribeSystemData = eventService.onSystemData((systemData: SystemData) => {
      setSystemData(systemData)
      setLoading(false)
      setError(null)

      // 更新查询缓存
      queryClient.setQueryData(['system-data'], systemData)
    })

    // 监听错误事件
    const unsubscribeError = eventService.onError((error: any) => {
      console.error('Backend error:', error)
      setError(error.message || '后端错误')
      setLoading(false)
    })

    // 监听应用就绪事件
    const unsubscribeAppReady = eventService.onAppReady((data: any) => {
      console.log('App ready:', data)
      setLoading(false)
      setError(null)
    })

    // 清理函数
    return () => {
      // 这里应该有取消订阅的逻辑，但 Wails 的事件系统目前不支持
      // 所以我们只清理定时器
    }
  }, [setSystemData, setLoading, setError, queryClient])

  // 自动刷新控制
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        refetch()
      }, refreshInterval)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoRefresh, refreshInterval, refetch])

  // 手动刷新
  const refresh = () => {
    refetch()
  }

  return {
    data: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
    refresh,
  }
}

// 使用历史数据的 Hook
export function useHistoryData(metric: string, duration: number) {
  const { setHistoryData } = useAppStore()

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['history-data', metric, duration],
    queryFn: async () => {
      const response = await systemAPI.getHistoryData({ metric, duration })
      if (!response.success) {
        throw new Error(response.error || '获取历史数据失败')
      }
      return response.data
    },
    staleTime: 30000, // 30秒内的历史数据被认为是新鲜的
    enabled: !!metric && duration > 0,
  })

  // 更新状态
  useEffect(() => {
    if (data) {
      setHistoryData(metric, data)
    }
  }, [data, metric, setHistoryData])

  return {
    data: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  }
}

// 使用系统基本信息的 Hook
export function useSystemInfo() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['system-info'],
    queryFn: async () => {
      const response = await systemAPI.getSystemInfo()
      if (!response.success) {
        throw new Error(response.error || '获取系统信息失败')
      }
      return response.data
    },
    staleTime: 60000 * 5, // 5分钟内的系统信息被认为是新鲜的
    refetchOnWindowFocus: false,
  })

  return {
    data: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
  }
}