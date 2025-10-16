import React, { useState, useEffect } from 'react'
import {
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Minus
} from 'lucide-react'

// 模拟历史数据
const generateMockHistoryData = (hours: number) => {
  const data = []
  const now = new Date()

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      timestamp: timestamp.toISOString(),
      cpu: 20 + Math.random() * 60,
      memory: 40 + Math.random() * 40,
      disk: 30 + Math.random() * 30,
      network: Math.random() * 100
    })
  }

  return data
}

const mockHistoryData = {
  '1h': generateMockHistoryData(1),
  '6h': generateMockHistoryData(6),
  '24h': generateMockHistoryData(24),
  '7d': generateMockHistoryData(168),
  '30d': generateMockHistoryData(720)
}

const timeRanges = [
  { value: '1h', label: '最近1小时' },
  { value: '6h', label: '最近6小时' },
  { value: '24h', label: '最近24小时' },
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' }
]

const metrics = [
  { key: 'cpu', label: 'CPU使用率', icon: Cpu, unit: '%', color: 'blue' },
  { key: 'memory', label: '内存使用率', icon: MemoryStick, unit: '%', color: 'green' },
  { key: 'disk', label: '磁盘使用率', icon: HardDrive, unit: '%', color: 'purple' },
  { key: 'network', label: '网络流量', icon: Network, unit: 'MB/s', color: 'orange' }
]

export default function History() {
  const [selectedRange, setSelectedRange] = useState('24h')
  const [selectedMetrics, setSelectedMetrics] = useState(['cpu', 'memory'])
  const [loading, setLoading] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  const currentData = mockHistoryData[selectedRange as keyof typeof mockHistoryData] || []

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const handleExport = () => {
    const csvContent = [
      ['时间', 'CPU使用率', '内存使用率', '磁盘使用率', '网络流量'].join(','),
      ...currentData.map(item => [
        new Date(item.timestamp).toLocaleString('zh-CN'),
        item.cpu.toFixed(2),
        item.memory.toFixed(2),
        item.disk.toFixed(2),
        item.network.toFixed(2)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `system-history-${selectedRange}.csv`
    link.click()
  }

  const getMetricStats = (metric: string) => {
    if (currentData.length === 0) return { avg: 0, min: 0, max: 0, trend: 0 }

    const values = currentData.map(item => item[metric as keyof typeof item] as number)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    // 计算趋势（简单比较前半部分和后半部分的平均值）
    const half = Math.floor(values.length / 2)
    const firstHalf = values.slice(0, half)
    const secondHalf = values.slice(half)
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    const trend = ((secondAvg - firstAvg) / firstAvg) * 100

    return { avg, min, max, trend }
  }

  const getTrendIcon = (trend: number) => {
    if (Math.abs(trend) < 1) return <Minus className="w-4 h-4 text-gray-500" />
    return trend > 0 ?
      <TrendingUp className="w-4 h-4 text-red-500" /> :
      <TrendingDown className="w-4 h-4 text-green-500" />
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            历史数据
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看系统性能历史趋势和统计信息
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            导出
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {/* 时间范围选择器 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">时间范围</h3>
            </div>
            <div className="flex items-center space-x-2">
              {timeRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => setSelectedRange(range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 指标筛选器 */}
      {showFilter && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">选择指标</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map(metric => {
                const Icon = metric.icon
                const isSelected = selectedMetrics.includes(metric.key)
                return (
                  <button
                    key={metric.key}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key))
                      } else {
                        setSelectedMetrics([...selectedMetrics, metric.key])
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${getColorClasses(metric.color)} border-current`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{metric.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.filter(metric => selectedMetrics.includes(metric.key)).map(metric => {
          const Icon = metric.icon
          const stats = getMetricStats(metric.key)
          return (
            <div key={metric.key} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {getTrendIcon(stats.trend)}
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {metric.label}
                </h3>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.avg.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">{metric.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">最小: {stats.min.toFixed(1)}</span>
                    <span className="text-gray-500">最大: {stats.max.toFixed(1)}</span>
                  </div>
                  {Math.abs(stats.trend) >= 1 && (
                    <div className={`text-xs font-medium ${
                      stats.trend > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {stats.trend > 0 ? '↑' : '↓'} {Math.abs(stats.trend).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 图表区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                性能趋势图
              </h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>更新时间: {new Date().toLocaleTimeString('zh-CN')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">图表组件</h3>
              <p>性能趋势图表将在这里显示</p>
              <div className="mt-4 text-sm">
                <p>已选择指标: {selectedMetrics.map(m => metrics.find(mt => mt.key === m)?.label).join(', ')}</p>
                <p>时间范围: {timeRanges.find(r => r.value === selectedRange)?.label}</p>
                <p>数据点: {currentData.length} 个</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              详细数据
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    时间
                  </th>
                  {metrics.filter(metric => selectedMetrics.includes(metric.key)).map(metric => (
                    <th key={metric.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {metric.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentData.slice(0, 10).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(item.timestamp).toLocaleString('zh-CN')}
                    </td>
                    {metrics.filter(metric => selectedMetrics.includes(metric.key)).map(metric => (
                      <td key={metric.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {(item[metric.key as keyof typeof item] as number).toFixed(1)} {metric.unit}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {currentData.length > 10 && (
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              显示前10条记录，共{currentData.length}条。请导出数据查看完整记录。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}