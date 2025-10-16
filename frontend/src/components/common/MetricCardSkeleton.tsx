import React from 'react'

export default function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      {/* 图标占位 */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>

      {/* 数值占位 */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
      </div>

      {/* 趋势占位 */}
      <div className="mt-4 flex items-center space-x-2">
        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  )
}