import React from 'react'
import { MemoryStick } from 'lucide-react'

export default function MemoryGraph() {
  return (
    <div className="chart-container">
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <MemoryStick className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">内存图表</p>
          <p className="text-xs mt-1">图表功能开发中...</p>
        </div>
      </div>
    </div>
  )
}