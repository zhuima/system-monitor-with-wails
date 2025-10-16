import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Activity,
  Bell,
  Settings,
  Info,
  Menu,
  X,
  Moon,
  Sun,
  Monitor,
  Clock
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigation = [
  {
    name: '仪表板',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '进程管理',
    href: '/processes',
    icon: Cpu,
  },
  {
    name: '历史数据',
    href: '/history',
    icon: Activity,
  },
  {
    name: '硬件参数',
    href: '/hardware',
    icon: Monitor,
  },
  {
    name: '告警管理',
    href: '/alerts',
    icon: Bell,
  },
  {
    name: '关于应用',
    href: '/about',
    icon: Info,
  },
  {
    name: '设置',
    href: '/settings',
    icon: Settings,
  },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDark, setIsDark] = useState(false)

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 检测当前主题
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  // 切换主题
  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  // 格式化运行时间（示例数据，实际应该从后端获取）
  const formatUptime = () => {
    // 这里应该从系统数据获取真实运行时间
    return '2天 14小时 32分钟'
  }

  return (
    <div className={`fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  系统监控
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  v1.0.0
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {collapsed ? (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <item.icon className={`flex-shrink-0 w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!collapsed && item.name}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* 底部状态区域 */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            {/* 系统状态 */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              {!collapsed && (
                <span className="text-xs text-gray-500 dark:text-gray-400">状态</span>
              )}
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                {!collapsed && (
                  <span className="text-xs text-green-600 dark:text-green-400">正常</span>
                )}
              </span>
            </div>

            {/* 运行时间 */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              {!collapsed && (
                <span className="text-xs text-gray-500 dark:text-gray-400">运行时间</span>
              )}
              <span className="text-xs text-gray-900 dark:text-gray-100">
                {collapsed ? '2天' : formatUptime()}
              </span>
            </div>

            {/* 当前时间 */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              {!collapsed && (
                <span className="text-xs text-gray-500 dark:text-gray-400">时间</span>
              )}
              <span className="text-xs text-gray-900 dark:text-gray-100">
                {collapsed
                  ? currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                  : currentTime.toLocaleTimeString('zh-CN')
                }
              </span>
            </div>

            {/* 主题切换 */}
            <button
              onClick={toggleTheme}
              className={`
                w-full flex items-center p-2 text-sm text-gray-600 hover:text-gray-900
                hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100
                dark:hover:bg-gray-700 rounded-lg transition-colors
                ${collapsed ? 'justify-center' : 'justify-center'}
              `}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {!collapsed && (
                <span className="ml-2">{isDark ? '浅色' : '深色'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}