import React, { useEffect } from 'react'
import { Cpu, MemoryStick, HardDrive, Network, Activity, AlertTriangle, Monitor, Server } from 'lucide-react'
import { useSystemData } from '../hooks/useSystemData'
import { useSystemInfo } from '../hooks/useSystemData'
import MetricCard from '../components/system/MetricCard'
import CPUGraph from '../components/charts/CPUGraph'
import MemoryGraph from '../components/charts/MemoryGraph'
import NetworkGraph from '../components/charts/NetworkGraph'
import MetricCardSkeleton from '../components/common/MetricCardSkeleton'
import SystemInfoSkeleton from '../components/common/SystemInfoSkeleton'
import ChartSkeleton from '../components/common/ChartSkeleton'

export default function Dashboard() {
  const { data: systemData, isLoading: systemLoading, error: systemError } = useSystemData()
  const { data: systemInfo, isLoading: infoLoading } = useSystemInfo()

  // 调试日志：查看实际数据结构
  useEffect(() => {
    console.log('🐛 Dashboard Debug - systemData:', systemData)
    console.log('🐛 Dashboard Debug - systemData type:', typeof systemData)
    if (systemData) {
      console.log('🐛 Dashboard Debug - systemData keys:', Object.keys(systemData))
      console.log('🐛 Dashboard Debug - systemData.cpu:', systemData.cpu)
      console.log('🐛 Dashboard Debug - systemData.memory:', systemData.memory)
    }
  }, [systemData])

  // 显示错误状态但不阻塞整个页面
  const hasError = systemError || (!systemData && !systemLoading)

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 页面标题区域 - 简化设计 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              System Monitor
            </h1>
            <p className="text-blue-100 text-sm">
              实时监控系统性能和资源使用情况
            </p>
          </div>
        </div>
      </div>

      {/* 核心指标卡片 - 秒开体验，数据加载时显示骨架屏 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemData ? (
          <>
            <MetricCard
              title="CPU 使用率"
              value={systemData.cpu.usage}
              unit="%"
              icon={<Cpu className="w-6 h-6" />}
              threshold={{ warning: 70, critical: 90 }}
              trend={0}
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
              value={systemData.network.length > 0 ? systemData.network[0].bytes_sent / (1024 * 1024) : 0}
              unit="MB/s"
              icon={<Network className="w-6 h-6" />}
              threshold={{ warning: 100, critical: 500 }}
              trend={0}
            />
          </>
        ) : (
          // 数据未加载时显示骨架屏
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        )}
      </div>

      {/* 系统信息详情区域 - 改进布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 系统基本信息 */}
        {systemInfo ? (
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Server className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  系统概览
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">主机名</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {systemInfo.hostname}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">操作系统</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {systemInfo.os} {systemInfo.platform_version}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">架构</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {systemInfo.architecture}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">运行时间</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatUptime(systemInfo.uptime)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 系统信息骨架屏
          <div className="lg:col-span-3">
            <SystemInfoSkeleton />
          </div>
        )}
      </div>

      {/* 详细信息区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPU 详情 */}
        {systemInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Cpu className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  CPU 详情
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">型号</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      Intel Core i7-9750H
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">核心数</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      6 核心 / 12 线程
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">主频</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      2.6 GHz
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">缓存</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      12 MB
                    </p>
                  </div>
                </div>

                {/* 各核心使用率 */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">各核心使用率</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[42.1, 48.5, 39.8, 51.2, 44.7, 46.3].map((usage, index) => (
                      <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          核心{index + 1}
                        </div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {usage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 内存详情 */}
        {systemData ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <MemoryStick className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  内存详情
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">总内存</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {(systemData.memory.total / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">已使用</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {(systemData.memory.used / (1024 * 1024 * 1024)).toFixed(1)} GB
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">可用</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {(systemData.memory.available / (1024 * 1024 * 1024)).toFixed(1)} GB
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">缓存</p>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    2 GB
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 内存详情骨架屏
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="h-20 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
                <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
              </div>
              <div className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
            </div>
          </div>
        )}

        {/* 磁盘详情 */}
        {systemData ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <HardDrive className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  磁盘详情
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">C: (Windows) NTFS</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">500 GB 总容量</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">40.0%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        200 GB / 500 GB
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 磁盘详情骨架屏
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-24 bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
            </div>
          </div>
        )}
      </div>

        {/* 图表区域 - 改进布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU 使用率图表 */}
        {systemData ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Cpu className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  CPU 使用率趋势
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64">
                <CPUGraph />
              </div>
            </div>
          </div>
        ) : (
          <ChartSkeleton />
        )}

        {/* 内存使用图表 */}
        {systemData ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <MemoryStick className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  内存使用趋势
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64">
                <MemoryGraph />
              </div>
            </div>
          </div>
        ) : (
          <ChartSkeleton />
        )}
      </div>

      {/* 网络流量图表 - 全宽 */}
      {systemData ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <Network className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                网络流量监控
              </h3>
              <div className="ml-auto flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">下载</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">上传</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-64">
              <NetworkGraph />
            </div>
          </div>
        </div>
      ) : (
        <ChartSkeleton />
      )}

      {/* 错误提示 - 非阻塞式 */}
      {hasError && (
        <div className="fixed top-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-sm animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">连接异常</h4>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                正在尝试重新连接...
              </p>
            </div>
          </div>
        </div>
      )}
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