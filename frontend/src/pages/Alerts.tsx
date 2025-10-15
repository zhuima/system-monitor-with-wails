import React from 'react'
import { Bell } from 'lucide-react'

export default function Alerts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          告警管理
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          配置和管理系统告警规则
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Bell className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">告警管理功能</h3>
              <p>告警管理功能开发中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}