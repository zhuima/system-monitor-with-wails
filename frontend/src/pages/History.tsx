import React from 'react'
import { Activity } from 'lucide-react'

export default function History() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          历史数据
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          查看系统性能历史趋势
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">历史数据功能</h3>
              <p>历史数据查看功能开发中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}