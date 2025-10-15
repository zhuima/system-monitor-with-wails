import React from 'react'
import { Cpu } from 'lucide-react'

export default function Processes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          进程管理
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          监控和管理系统进程
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Cpu className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">进程管理功能</h3>
              <p>进程管理功能开发中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}