import React from 'react'
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
  X
} from 'lucide-react'

interface SidebarProps {
  open: boolean
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
    name: '告警管理',
    href: '/alerts',
    icon: Bell,
  },
  {
    name: '设置',
    href: '/settings',
    icon: Settings,
  },
]

export default function Sidebar({ open }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* 移动端遮罩 */}
      {open && (
        <div className="fixed inset-0 z-20 lg:hidden">
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* 侧边栏 */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* 侧边栏头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  系统监控
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  v1.0.0
                </p>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    nav-item
                    ${isActive ? 'nav-item-active' : 'nav-item-inactive'}
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* 系统信息 */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {/* 系统状态 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">状态</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-green-600 dark:text-green-400">正常</span>
                </span>
              </div>

              {/* 运行时间 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">运行时间</span>
                <span className="text-gray-900 dark:text-gray-100">
                  2天 14小时
                </span>
              </div>

              {/* 系统信息按钮 */}
              <button className="w-full mt-4 p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center">
                <Info className="w-4 h-4 mr-2" />
                系统信息
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}