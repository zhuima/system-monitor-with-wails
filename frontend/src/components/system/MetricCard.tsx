import React from 'react'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  unit: string
  icon: React.ReactNode
  threshold: {
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
  threshold,
  trend
}: MetricCardProps) {
  const getStatus = () => {
    if (value >= threshold.critical) return 'critical'
    if (value >= threshold.warning) return 'warning'
    return 'healthy'
  }

  const getStatusColor = () => {
    switch (getStatus()) {
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-green-600 dark:text-green-400'
    }
  }

  const getStatusBgColor = () => {
    switch (getStatus()) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20'
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20'
      default:
        return 'bg-green-100 dark:bg-green-900/20'
    }
  }

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return null
    return trend > 0 ? '↑' : '↓'
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-gray-500'
    return trend > 0 ? 'text-red-500' : 'text-green-500'
  }

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getStatusBgColor()}`}>
          <div className={getStatusColor()}>
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm font-medium ${getTrendColor()}`}>
            <span className="mr-1">{getTrendIcon()}</span>
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline">
          <span className={`metric-value ${getStatusColor()}`}>
            {value.toFixed(1)}
          </span>
          <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        </div>
        <p className="metric-label">
          {title}
        </p>
      </div>

      {/* 进度条 */}
      <div className="mt-4">
        <div className="progress">
          <div
            className={`progress-bar ${
              getStatus() === 'critical'
                ? 'bg-red-500'
                : getStatus() === 'warning'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}