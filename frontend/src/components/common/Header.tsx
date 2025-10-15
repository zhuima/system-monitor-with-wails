import React from 'react'
import { Cpu, HardDrive, MemoryStick, Network, Moon, Sun, Monitor, Menu, X } from 'lucide-react'
import { useTheme, useNotifications } from '../../hooks/useLocalStorage'
import { useSystemData } from '../../hooks/useSystemData'
import { useSidebarState } from '../../hooks/useLocalStorage'
import StatusIndicator from './StatusIndicator'

export default function Header() {
  const [theme, setTheme] = useTheme()
  const [sidebarOpen, setSidebarOpen, toggleSidebar] = useSidebarState()
  const { data: systemData } = useSystemData()
  const [, , showNotification] = useNotifications()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'auto' : 'dark')
  }

  const testNotification = () => {
    showNotification('系统监控', {
      body: '这是一个测试通知',
      icon: '/favicon.ico',
    })
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />
      case 'dark':
        return <Moon className="w-5 h-5" />
      default:
        return <Monitor className="w-5 h-5" />
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧：Logo和导航 */}
          <div className="flex items-center">
            {/* 移动端菜单按钮 */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 lg:hidden"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  系统监控
                </h1>
              </div>
            </div>

            {/* 快速状态指标（桌面端） */}
            {systemData && (
              <div className="hidden lg:flex items-center space-x-6 ml-10">
                <StatusIndicator
                  icon={<Cpu className="w-4 h-4" />}
                  value={systemData.cpu.usage}
                  label="CPU"
                  unit="%"
                  threshold={{ warning: 70, critical: 90 }}
                />
                <StatusIndicator
                  icon={<MemoryStick className="w-4 h-4" />}
                  value={systemData.memory.used_percent}
                  label="内存"
                  unit="%"
                  threshold={{ warning: 80, critical: 95 }}
                />
                <StatusIndicator
                  icon={<HardDrive className="w-4 h-4" />}
                  value={systemData.disk.length > 0 ? systemData.disk[0].used_percent : 0}
                  label="磁盘"
                  unit="%"
                  threshold={{ warning: 80, critical: 95 }}
                />
                <StatusIndicator
                  icon={<Network className="w-4 h-4" />}
                  value={0} // 暂时设为0，后续实现网络速率计算
                  label="网络"
                  unit="MB/s"
                />
              </div>
            )}
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-2">
            {/* 测试通知按钮（开发环境） */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={testNotification}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                title="测试通知"
              >
                Network
              </button>
            )}

            {/* 主题切换 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              title={`当前主题: ${theme === 'auto' ? '自动' : theme === 'dark' ? '深色' : '浅色'}`}
            >
              {getThemeIcon()}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}