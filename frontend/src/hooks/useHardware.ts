import { useQuery } from '@tanstack/react-query'
import { systemAPI } from '../services/api'
import { HardwareInfo } from '../types/system'

export function useHardwareInfo() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hardware-info'],
    queryFn: async () => {
      const res = await systemAPI.getHardwareInfo()
      if (!res.success || !res.data) {
        throw new Error(res.error || '获取硬件参数失败')
      }
      return res.data as HardwareInfo
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  return {
    data: data || null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  }
}