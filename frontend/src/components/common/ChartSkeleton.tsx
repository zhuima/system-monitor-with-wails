import React from 'react'

export default function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-40 animate-pulse"></div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-64 bg-gray-100 dark:bg-gray-700/50 rounded-xl relative overflow-hidden">
          {/* 模拟图表线条 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full flex flex-col justify-between p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}