import React from 'react'
import { Cpu, MemoryStick, HardDrive, Network, Activity, AlertTriangle } from 'lucide-react'
import { useSystemData } from '../hooks/useSystemData'
import { useSystemInfo } from '../hooks/useSystemData'
import MetricCard from '../components/system/MetricCard'
import CPUGraph from '../components/charts/CPUGraph'
import MemoryGraph from '../components/charts/MemoryGraph'
import NetworkGraph from '../components/charts/NetworkGraph'
import Loading from '../components/common/Loading'

export default function Dashboard() {
  const { data: systemData, isLoading, error } = useSystemData()
  const { data: systemInfo } = useSystemInfo()

  if (isLoading) {
    return <Loading text="正在加载系统数据..." />
  }

  if (error || !systemData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          数据加载失败
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {error || '无法获取系统数据'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          系统仪表板
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          实时监控系统性能和资源使用情况
        </p>
      </div>

      {/* 系统信息 */}
      {systemInfo && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              系统信息
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">主机名</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {systemInfo.hostname}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">操作系统</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {systemInfo.os} {systemInfo.platform_version}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">架构</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {systemInfo.architecture}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">运行时间</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatUptime(systemInfo.uptime)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CPU使用率"
          value={systemData.cpu.usage}
          unit="%"
          icon={<Cpu className="w-6 h-6" />}
          threshold={{ warning: 70, critical: 90 }}
          trend={0} // 这里可以计算趋势
        />
        <MetricCard
          title="内存使用率"
          value={systemData.memory.used_percent}
          unit="%"
          icon={<MemoryStick className="w-6 h-6" />}
          threshold={{ warning: 80, critical: 95 }}
          trend={0}
        />
        <MetricCard
          title="磁盘使用率"
          value={systemData.disk.length > 0 ? systemData.disk[0].used_percent : 0}
          unit="%"
          icon={<HardDrive className="w-6 h-6" />}
          threshold={{ warning: 80, critical: 95 }}
          trend={0}
        />
        <MetricCard
          title="网络流量"
          value={0} // 暂时设为0
          unit="MB/s"
          icon={<Network className="w-6 h-6" />}
          threshold={{ warning: 100, critical: 500 }}
          trend={0}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              CPU使用率
            </h3>
          </div>
          <div className="card-body">
            <CPUGraph />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              内存使用情况
            </h3>
          </div>
          <div className="card-body">
            <MemoryGraph />
          </div>
        </div>
      </div>

      {/* 网络流量图表 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            网络流量
          </h3>
        </div>
        <div className="card-body">
          <NetworkGraph />
        </div>
      </div>

      {/* 进程信息 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            进程概览
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemData.processes.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                总进程数
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {systemData.processes.filter(p => p.cpu_percent > 5).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                高CPU使用进程
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {systemData.processes.filter(p => p.mem_usage > 5).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                高内存使用进程
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 辅助函数
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}天 ${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}