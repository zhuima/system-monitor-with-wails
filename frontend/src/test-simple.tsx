import React from 'react'

// 简单的测试组件，确保能正常渲染
export default function TestSimple() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🚀 System Monitor
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          应用正在加载中...
        </p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">
          如果你看到这个页面，说明 React 应用正常工作
        </div>
      </div>
    </div>
  )
}