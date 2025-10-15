import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useSidebarState } from '../../hooks/useLocalStorage'

export default function Layout() {
  const [sidebarOpen] = useSidebarState()

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <Sidebar open={sidebarOpen} />

      {/* 主内容区域 */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* 头部 */}
        <Header />

        {/* 主要内容 */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}