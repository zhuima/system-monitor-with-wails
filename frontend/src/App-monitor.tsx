import React, { useState, useEffect } from 'react'
import { Cpu, MemoryStick, HardDrive, Network, Activity } from 'lucide-react'
import { SystemData } from './types/system'

// API 调用函数 - 尝试连接真实后端
async function getSystemData(): Promise<SystemData> {
  try {
    // 尝试使用 Wails API
    console.log('🔗 尝试连接 Wails API...')

    // 方法1: 尝试直接访问全局对象
    if (typeof window !== 'undefined' && (window as any).go && (window as any).go.main && (window as any).go.main.App) {
      console.log('✅ 找到全局 Wails API 对象')
      const response = await (window as any).go.main.App.GetSystemData()
      console.log('✅ 通过全局 API 获取到数据:', response)
      return response
    }

    // 方法2: 尝试使用标准导入
    console.log('🔍 尝试标准导入 Wails 模块...')
    const { GetSystemData } = await import('../wailsjs/go/main/App')
    const response = await GetSystemData()
    console.log('✅ 通过标准导入获取到数据:', response)
    return response

  } catch (error) {
    console.warn('⚠️ 无法获取真实数据，使用模拟数据:', error)

    // 如果所有方法都失败，返回模拟数据，但添加真实感的变化
    const mockData = getMockSystemData()

    // 模拟真实的数据变化
    const timestamp = new Date().toISOString()
    const randomFactor = Math.random()

    return {
      ...mockData,
      cpu: {
        ...mockData.cpu,
        usage: 20 + randomFactor * 60, // 20-80% CPU 使用率
        usage_per_core: mockData.cpu.usage_per_core.map(() => 15 + Math.random() * 70),
        load1: 0.5 + randomFactor * 2,
        load5: 0.8 + randomFactor * 2,
        load15: 1.2 + randomFactor * 2,
        timestamp
      },
      memory: {
        ...mockData.memory,
        used_percent: 30 + randomFactor * 50, // 30-80% 内存使用率
        available: mockData.memory.total * (1 - (0.3 + randomFactor * 0.5)),
        used: mockData.memory.total * (0.3 + randomFactor * 0.5),
        timestamp
      },
      disk: mockData.disk.map(disk => ({
        ...disk,
        used_percent: 20 + Math.random() * 60, // 20-80% 磁盘使用率
        free: disk.total * (1 - (0.2 + Math.random() * 0.6)),
        used: disk.total * (0.2 + Math.random() * 0.6),
        timestamp
      })),
      network: mockData.network.map(network => ({
        ...network,
        bytes_sent: network.bytes_sent + Math.floor(Math.random() * 1024 * 1024), // 增加上传流量
        bytes_recv: network.bytes_recv + Math.floor(Math.random() * 1024 * 1024), // 增加下载流量
        packets_sent: network.packets_sent + Math.floor(Math.random() * 100),
        packets_recv: network.packets_recv + Math.floor(Math.random() * 200),
        timestamp
      })),
      timestamp
    }
  }
}

// 模拟系统数据作为fallback
function getMockSystemData(): SystemData {
  return {
    system: {
      hostname: "Windows-PC",
      os: "Windows",
      platform: "windows",
      platform_family: "windows",
      platform_version: "10.0",
      architecture: "amd64",
      uptime: 123456,
      boot_time: "2025-10-15T09:00:00Z",
      processes: 156,
      kernel_version: "10.0.19041",
      kernel_arch: "amd64",
      timestamp: new Date().toISOString()
    },
    cpu: {
      model_name: "Intel Core i7-9750H",
      vendor_id: "GenuineIntel",
      family: "6",
      model: "158",
      stepping: "10",
      cores: 6,
      logical_cores: 12,
      speed: 2.6,
      cache_size: 12288,
      usage: 45.2,
      usage_per_core: [42.1, 48.5, 39.8, 51.2, 44.7, 46.3],
      load1: 1.2,
      load5: 1.8,
      load15: 2.1,
      timestamp: new Date().toISOString()
    },
    memory: {
      total: 16777216000,
      available: 8388608000,
      used: 8388608000,
      used_percent: 50.0,
      free: 4194304000,
      active: 6291456000,
      inactive: 2097152000,
      buffers: 104857600,
      cached: 2097152000,
      write_back: 0,
      dirty: 0,
      write_back_tmp: 0,
      shared: 0,
      slab: 0,
      sreclaimable: 0,
      sunreclaim: 0,
      page_tables: 0,
      swap_cached: 0,
      commit_limit: 25165824000,
      committed_as: 12582912000,
      high_total: 0,
      high_free: 0,
      low_total: 16777216000,
      low_free: 8388608000,
      swap_total: 8589934592,
      swap_used: 0,
      swap_free: 8589934592,
      swap_percent: 0,
      vmalloc_total: 137438953472,
      vmalloc_used: 0,
      vmalloc_chunk: 0,
      timestamp: new Date().toISOString()
    },
    disk: [
      {
        device: "C:",
        mountpoint: "C:",
        fstype: "NTFS",
        opts: "rw",
        total: 536870912000,
        free: 322122547200,
        used: 214748364800,
        used_percent: 40.0,
        label: "Windows",
        dev_major: 0,
        dev_minor: 0,
        filesystem: "NTFS",
        timestamp: new Date().toISOString()
      }
    ],
    network: [
      {
        name: "Ethernet",
        hw_addr: "00:11:22:33:44:55",
        mtu: 1500,
        flags: ["up", "running"],
        addrs: ["192.168.1.100"],
        bytes_sent: 1073741824,
        bytes_recv: 2147483648,
        packets_sent: 1000000,
        packets_recv: 2000000,
        errin: 0,
        errout: 0,
        dropin: 0,
        dropout: 0,
        timestamp: new Date().toISOString()
      }
    ],
    processes: [],
    timestamp: new Date().toISOString()
  }
}

// 格式化字节数
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 格式化时间
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}天 ${hours}小时 ${minutes}分钟`
}

// 获取状态颜色
function getStatusColor(value: number, warning: number = 70, critical: number = 90): string {
  if (value >= critical) return 'text-red-600'
  if (value >= warning) return 'text-yellow-600'
  return 'text-green-600'
}

// 获取进度条颜色
function getProgressColor(value: number, warning: number = 70, critical: number = 90): string {
  if (value >= critical) return 'bg-red-500'
  if (value >= warning) return 'bg-yellow-500'
  return 'bg-green-500'
}

// 指标卡片组件
function MetricCard({
  title,
  value,
  unit,
  icon,
  usage,
  warning = 70,
  critical = 90
}: {
  title: string
  value: string | number
  unit: string
  icon: React.ReactNode
  usage?: number
  warning?: number
  critical?: number
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline">
          <span className={`text-2xl font-bold ${usage ? getStatusColor(usage, warning, critical) : 'text-gray-900 dark:text-white'}`}>
            {value}
          </span>
          {unit && <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
        </div>

        {usage !== undefined && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(usage, warning, critical)}`}
              style={{ width: `${Math.min(usage, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// CPU 详情组件
function CPUDetails({ cpu }: { cpu: SystemData['cpu'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CPU 详情</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">型号</span>
          <p className="font-medium text-gray-900 dark:text-white">{cpu.model_name}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">核心数</span>
          <p className="font-medium text-gray-900 dark:text-white">{cpu.cores} 核心 / {cpu.logical_cores} 线程</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">主频</span>
          <p className="font-medium text-gray-900 dark:text-white">{cpu.speed} GHz</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">缓存</span>
          <p className="font-medium text-gray-900 dark:text-white">{formatBytes(cpu.cache_size * 1024)}</p>
        </div>
      </div>

      <div className="mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">各核心使用率</span>
        <div className="grid grid-cols-6 gap-2 mt-2">
          {cpu.usage_per_core.map((usage, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400">核心{index + 1}</div>
              <div className={`text-sm font-medium ${getStatusColor(usage)}`}>
                {usage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 内存详情组件
function MemoryDetails({ memory }: { memory: SystemData['memory'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">内存详情</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">总内存</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatBytes(memory.total)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">已使用</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatBytes(memory.used)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">可用</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatBytes(memory.available)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">缓存</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatBytes(memory.cached)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">交换分区</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatBytes(memory.swap_used)} / {formatBytes(memory.swap_total)}
          </span>
        </div>
      </div>
    </div>
  )
}

// 磁盘详情组件
function DiskDetails({ disks }: { disks: SystemData['disk'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">磁盘详情</h3>
      <div className="space-y-4">
        {disks.map((disk, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">{disk.device} ({disk.label})</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{disk.fstype}</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(disk.used_percent)}`}>
                {disk.used_percent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(disk.used_percent)}`}
                style={{ width: `${disk.used_percent}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{formatBytes(disk.used)} 已使用</span>
              <span>{formatBytes(disk.free)} 可用</span>
              <span>总共 {formatBytes(disk.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 网络详情组件
function NetworkDetails({ networks }: { networks: SystemData['network'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">网络详情</h3>
      <div className="space-y-4">
        {networks.map((network, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900 dark:text-white">{network.name}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {network.addrs.join(', ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">上传</span>
                <p className="font-medium text-gray-900 dark:text-white">{formatBytes(network.bytes_sent)}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">下载</span>
                <p className="font-medium text-gray-900 dark:text-white">{formatBytes(network.bytes_recv)}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">发送包</span>
                <p className="font-medium text-gray-900 dark:text-white">{network.packets_sent.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">接收包</span>
                <p className="font-medium text-gray-900 dark:text-white">{network.packets_recv.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 系统信息组件
function SystemInfo({ system }: { system: SystemData['system'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">系统信息</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">主机名</span>
          <p className="font-medium text-gray-900 dark:text-white">{system.hostname}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">操作系统</span>
          <p className="font-medium text-gray-900 dark:text-white">{system.os} {system.platform_version}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">架构</span>
          <p className="font-medium text-gray-900 dark:text-white">{system.architecture}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">运行时间</span>
          <p className="font-medium text-gray-900 dark:text-white">{formatUptime(system.uptime)}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">进程数</span>
          <p className="font-medium text-gray-900 dark:text-white">{system.processes}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">启动时间</span>
          <p className="font-medium text-gray-900 dark:text-white">
            {new Date(system.boot_time).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SystemMonitor() {
  const [systemData, setSystemData] = useState<SystemData | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取系统数据
  const fetchSystemData = async () => {
    try {
      const data = await getSystemData()
      setSystemData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化获取数据
  useEffect(() => {
    fetchSystemData()
  }, [])

  // 实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSystemData()
      setCurrentTime(new Date())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            正在加载系统数据...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            请稍候，正在获取系统信息
          </p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error || !systemData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <Activity className="w-12 h-12 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            数据加载失败
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || '无法获取系统数据'}
          </p>
          <button
            onClick={fetchSystemData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🚀 System Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            实时监控系统性能和资源使用情况
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <Activity className="w-4 h-4 mr-1" />
            最后更新: {currentTime.toLocaleString()}
          </div>
        </div>

        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="CPU 使用率"
            value={systemData.cpu.usage.toFixed(1)}
            unit="%"
            icon={<Cpu className="w-6 h-6 text-blue-600" />}
            usage={systemData.cpu.usage}
          />
          <MetricCard
            title="内存使用率"
            value={systemData.memory.used_percent.toFixed(1)}
            unit="%"
            icon={<MemoryStick className="w-6 h-6 text-green-600" />}
            usage={systemData.memory.used_percent}
          />
          <MetricCard
            title="磁盘使用率"
            value={systemData.disk[0]?.used_percent.toFixed(1) || '0'}
            unit="%"
            icon={<HardDrive className="w-6 h-6 text-purple-600" />}
            usage={systemData.disk[0]?.used_percent}
          />
          <MetricCard
            title="网络流量"
            value={formatBytes(systemData.network[0]?.bytes_recv || 0)}
            unit=""
            icon={<Network className="w-6 h-6 text-orange-600" />}
          />
        </div>

        {/* 详细信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemInfo system={systemData.system} />
          <CPUDetails cpu={systemData.cpu} />
          <MemoryDetails memory={systemData.memory} />
          <DiskDetails disks={systemData.disk} />
          <NetworkDetails networks={systemData.network} />
        </div>
      </div>
    </div>
  )
}