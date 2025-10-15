import React from 'react'
import { Network } from 'lucide-react'

export default function NetworkGraph() {
  return (
    <div className="chart-full">
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <Network className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">网络流量图表</p>
          <p className="text-xs mt-1">图表功能开发中...</p>
        </div>
      </div>
    </div>
  )
}