import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  unit: string
  icon: React.ReactNode
  threshold?: {
    warning: number
    critical: number
  }
  trend?: number
}

export default function MetricCard({
  title,
  value,
  unit,
  icon,
  threshold = { warning: 70, critical: 90 },
  trend = 0
}: MetricCardProps) {
  // 确定状态
  const getStatus = () => {
    if (value >= threshold.critical) return 'critical'
    if (value >= threshold.warning) return 'warning'
    return 'healthy'
  }

  const status = getStatus()

  // 状态颜色配置
  const statusConfig = {
    healthy: {
      iconBg: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-500',
      valueColor: 'text-green-600 dark:text-green-400',
      progressColor: 'stroke-green-500',
      bgColor: 'bg-green-50/50 dark:bg-green-900/10'
    },
    warning: {
      iconBg: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-500',
      valueColor: 'text-yellow-600 dark:text-yellow-400',
      progressColor: 'stroke-yellow-500',
      bgColor: 'bg-yellow-50/50 dark:bg-yellow-900/10'
    },
    critical: {
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-500',
      valueColor: 'text-red-600 dark:text-red-400',
      progressColor: 'stroke-red-500',
      bgColor: 'bg-red-50/50 dark:bg-red-900/10'
    }
  }

  const config = statusConfig[status]

  // 趋势图标
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  // 圆形进度条参数
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${config.bgColor}`}>
      {/* 头部区域 */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${config.iconBg}`}>
          <div className={config.iconColor}>
            {icon}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {trend !== 0 && `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* 标题 */}
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </h3>

      {/* 主要数值和圆形进度条 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-bold ${config.valueColor}`}>
              {value.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {status === 'healthy' && '正常'}
            {status === 'warning' && '警告'}
            {status === 'critical' && '危险'}
          </div>
        </div>

        {/* 圆形进度条 */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            {/* 背景圆环 */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* 进度圆环 */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${config.progressColor} transition-all duration-500 ease-out`}
            />
          </svg>
          {/* 中心百分比 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-semibold ${config.valueColor}`}>
              {Math.round(value)}%
            </span>
          </div>
        </div>
      </div>

      {/* 阈值指示器 */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <span>警告 {threshold.warning}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span>危险 {threshold.critical}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}