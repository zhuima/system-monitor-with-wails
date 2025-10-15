import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatusIndicatorProps {
  icon: React.ReactNode
  value: number
  label: string
  unit?: string
  threshold?: {
    warning: number
    critical: number
  }
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StatusIndicator({
  icon,
  value,
  label,
  unit = '%',
  threshold = { warning: 70, critical: 90 },
  showIcon = true,
  size = 'md'
}: StatusIndicatorProps) {
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

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'lg':
        return 'text-base'
      default:
        return 'text-sm'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {showIcon && (
        <div className={`p-1 rounded ${getStatusBgColor()}`}>
          {React.cloneElement(icon as React.ReactElement, {
            className: `w-4 h-4 ${getStatusColor()}`,
          })}
        </div>
      )}
      <div className="flex flex-col">
        <div className="flex items-baseline space-x-1">
          <span className={`font-semibold ${getSizeClasses()} ${getStatusColor()}`}>
            {value.toFixed(1)}
          </span>
          <span className={`text-xs ${getStatusColor()}`}>{unit}</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
    </div>
  )
}