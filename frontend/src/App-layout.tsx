import React, { useState } from 'react'
import { Cpu, Settings, Info, Activity, Menu, X } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import SystemMonitor from './App-monitor'
import About from './pages/About'
import Settings from './pages/Settings'

export default function AppLayout() {
  const [currentPage, setCurrentPage] = useState('monitor')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case 'monitor':
        return <SystemMonitor />
      case 'about':
        return <About />
      case 'settings':
        return <Settings />
      default:
        return <SystemMonitor />
    }
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* 移动端菜单按钮 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* 侧边栏 */}
      <div className={`${isCollapsed ? 'hidden lg:block' : 'block'} lg:block`}>
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* 移动端遮罩 */}
      {isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  )
}