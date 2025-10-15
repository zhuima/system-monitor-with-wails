import React from 'react'
import { Cpu, Settings, Info, Activity, Menu } from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const menuItems = [
  {
    id: 'monitor',
    label: '系统监控',
    icon: <Cpu className="w-5 h-5" />,
    description: '查看系统资源使用情况'
  },
  {
    id: 'about',
    label: '关于',
    icon: <Info className="w-5 h-5" />,
    description: '软件信息和版本'
  },
  {
    id: 'settings',
    label: '设置',
    icon: <Settings className="w-5 h-5" />,
    description: '配置和偏好设置'
  }
]

export default function Sidebar({ currentPage, onPageChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <div className={`h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo区域 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'hidden' : 'block'}`}>
          <Activity className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            系统监控
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* 菜单项 */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 底部信息 */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 ${
        isCollapsed ? 'hidden' : 'block'
      }`}>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>状态</span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              运行中
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>版本</span>
            <span>1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}