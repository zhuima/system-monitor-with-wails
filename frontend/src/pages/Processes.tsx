import React, { useState, useEffect } from 'react'
import {
  Cpu,
  HardDrive,
  Activity,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { processAPI } from '../services/api'

interface Process {
  pid: number
  name: string
  cpu: number
  memory: number
  disk: number
  status: string
  user: string
  uptime: string
}

export default function Processes() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'disk' | 'pid'>('cpu')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取进程数据
  const fetchProcesses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await processAPI.getProcesses(sortBy, sortOrder, 100)

      if (response.success && response.data) {
        // 转换数据格式，确保数据完整性
        const processedData = response.data.map(process => ({
          pid: process.pid || 0,
          name: process.name || 'Unknown',
          cpu: process.cpu || 0,
          memory: process.memory || 0,
          disk: process.disk || 0,
          status: process.status || 'unknown',
          user: process.user || 'Unknown',
          uptime: process.uptime || '0m'
        }))
        setProcesses(processedData)
      } else {
        setError(response.error || '获取进程数据失败')
        setProcesses([])
      }
    } catch (err) {
      console.error('获取进程数据失败:', err)
      setError('网络错误，请检查连接')
      setProcesses([])
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和排序变化时重新获取数据
  useEffect(() => {
    fetchProcesses()
  }, [sortBy, sortOrder])

  // 定时刷新（每5秒）
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProcesses()
    }, 5000)

    return () => clearInterval(interval)
  }, [sortBy, sortOrder])

  const sortedProcesses = processes
    .filter(process =>
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.pid.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  const handleSort = (field: 'cpu' | 'memory' | 'disk' | 'pid') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleRefresh = () => {
    fetchProcesses()
  }

  const handleKillProcess = async (pid: number) => {
    if (window.confirm(`确定要终止进程 ${pid} 吗？此操作不可撤销。`)) {
      try {
        const response = await processAPI.killProcess(pid)
        if (response.success) {
          // 刷新进程列表
          fetchProcesses()
        } else {
          setError(`终止进程失败: ${response.error}`)
        }
      } catch (err) {
        console.error('终止进程失败:', err)
        setError('终止进程失败，请重试')
      }
    }
  }

  const formatMemory = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb.toFixed(1)} MB`
  }

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-red-600 dark:text-red-400'
    if (usage >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'sleeping':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            进程管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            监控和管理系统进程，实时查看资源使用情况
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索进程名称或PID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总进程数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{processes.length}</p>
              </div>
              <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总CPU使用</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {processes.reduce((sum, p) => sum + p.cpu, 0).toFixed(1)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总内存使用</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatMemory(processes.reduce((sum, p) => sum + p.memory, 0))}
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">活跃进程</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {processes.filter(p => p.status === 'running').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <X className="w-5 h-5 text-red-500" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">获取进程数据失败</h4>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* 进程列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">进程列表</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              共 {sortedProcesses.length} 个进程
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            /* 加载状态 */
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">正在加载进程数据...</h3>
              <p className="text-gray-600 dark:text-gray-400">请稍候，正在获取系统进程信息</p>
            </div>
          ) : sortedProcesses.length === 0 ? (
            /* 空状态 */
            <div className="p-12 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? '未找到匹配的进程' : '暂无进程数据'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm ? '请尝试其他搜索关键词' : '请检查系统连接或刷新重试'}
              </p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </button>
            </div>
          ) : (
            /* 进程表格 */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('pid')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>PID</span>
                        {sortBy === 'pid' && (
                          sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      进程名称
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('cpu')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>CPU</span>
                        {sortBy === 'cpu' && (
                          sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('memory')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>内存</span>
                        {sortBy === 'memory' && (
                          sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('disk')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>磁盘</span>
                        {sortBy === 'disk' && (
                          sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      运行时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedProcesses.map((process) => (
                    <tr key={process.pid} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {process.pid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mr-2">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                              {process.name.split('.')[0][0].toUpperCase()}
                            </span>
                          </div>
                          {process.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${getUsageColor(process.cpu)}`}>
                            {process.cpu.toFixed(1)}%
                          </span>
                          {process.cpu >= 20 && (
                            <TrendingUp className="w-4 h-4 text-red-500 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getUsageColor(process.memory / 10)}`}>
                          {formatMemory(process.memory)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {process.disk.toFixed(1)}%
                          </span>
                          {process.disk >= 10 && (
                            <TrendingUp className="w-4 h-4 text-red-500 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(process.status)}
                          <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                            {process.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {process.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {process.uptime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleKillProcess(process.pid)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="终止进程"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 进程详情提示 */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">i</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">
                <strong>提示：</strong>进程管理显示当前系统运行的进程及其资源使用情况。高CPU或内存使用的进程会以红色标识。
              </p>
              <p>
                点击列标题可以按该字段排序，搜索框支持按进程名称或PID过滤。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}