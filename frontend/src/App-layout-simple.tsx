import React, { useState } from 'react'
import { Cpu, Settings, Info, Activity, Menu, X } from 'lucide-react'

// 模拟系统数据
const mockSystemData = {
  system: {
    hostname: "Windows-PC",
    os: "Windows",
    platform_version: "10.0",
    architecture: "amd64",
    uptime: 123456,
    processes: 156,
    timestamp: new Date().toISOString()
  },
  cpu: {
    model_name: "Intel Core i7-9750H",
    cores: 6,
    logical_cores: 12,
    speed: 2.6,
    usage: 45.2,
    load1: 1.2,
    load5: 1.8,
    load15: 2.1,
    timestamp: new Date().toISOString()
  },
  memory: {
    total: 16777216000,
    used: 8388608000,
    available: 8388608000,
    used_percent: 50.0,
    timestamp: new Date().toISOString()
  },
  disk: [
    {
      device: "C:",
      total: 536870912000,
      used: 214748364800,
      free: 322122547200,
      used_percent: 40.0,
      timestamp: new Date().toISOString()
    }
  ],
  network: [
    {
      name: "Ethernet",
      bytes_sent: 1073741824,
      bytes_recv: 2147483648,
      timestamp: new Date().toISOString()
    }
  ],
  timestamp: new Date().toISOString()
}

// 格式化字节数
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 侧边栏组件
function Sidebar({ currentPage, onPageChange, isCollapsed, onToggleCollapse }: {
  currentPage: string
  onPageChange: (page: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}) {
  const menuItems = [
    { id: 'monitor', label: 'Monitor', icon: <Cpu className="w-5 h-5" /> },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div style={{
      width: isCollapsed ? '80px' : '256px',
      height: '100vh',
      backgroundColor: '#1f2937',
      color: 'white',
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo */}
      <div style={{
        padding: isCollapsed ? '16px' : '24px',
        borderBottom: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            🚀
          </div>
          {!isCollapsed && (
            <span style={{ marginLeft: '12px', fontSize: '18px', fontWeight: '600' }}>
              System Monitor
            </span>
          )}
        </div>
      </div>

      {/* 菜单项 */}
      <div style={{ flex: 1, padding: '16px 8px' }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: isCollapsed ? '12px' : '12px 16px',
              marginBottom: '8px',
              backgroundColor: currentPage === item.id ? '#3b82f6' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = '#374151'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {!isCollapsed && (
              <span style={{ marginLeft: '12px', fontSize: '14px' }}>{item.label}</span>
            )}
          </button>
        ))}
      </div>

      {/* 底部信息 */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #374151',
        fontSize: '12px',
        color: '#9ca3af',
        textAlign: isCollapsed ? 'center' : 'left'
      }}>
        {!isCollapsed && (
          <>
            <div>Version 1.0.0</div>
            <div style={{ marginTop: '4px' }}>© 2025</div>
          </>
        )}
        <button
          onClick={onToggleCollapse}
          style={{
            width: '100%',
            padding: '8px',
            marginTop: isCollapsed ? '8px' : '16px',
            backgroundColor: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

// 监控页面组件
function MonitorPage() {
  const [data, setData] = useState(mockSystemData)
  const [currentTime, setCurrentTime] = useState(new Date())

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      // 模拟数据变化
      setData(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: 20 + Math.random() * 60
        },
        memory: {
          ...prev.memory,
          used_percent: 30 + Math.random() * 50
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      flex: 1,
      height: '100vh',
      overflow: 'auto',
      backgroundColor: '#f3f4f6'
    }}>
      {/* 头部 */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          🚀 System Monitor
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280'
        }}>
          实时监控系统性能和资源使用情况
        </p>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
          最后更新: {currentTime.toLocaleString()}
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* CPU 卡片 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Cpu className="w-6 h-6 text-blue-600" style={{ marginRight: '8px' }} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                CPU 使用率
              </h3>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              {data.cpu.usage.toFixed(1)}%
            </div>
            <div style={{
              backgroundColor: '#e5e7eb',
              height: '8px',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: data.cpu.usage > 70 ? '#dc2626' : data.cpu.usage > 50 ? '#ca8a04' : '#16a34a',
                  width: `${data.cpu.usage}%`,
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* 内存卡片 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Activity className="w-6 h-6 text-green-600" style={{ marginRight: '8px' }} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                内存使用率
              </h3>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              {data.memory.used_percent.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              {formatBytes(data.memory.used)} / {formatBytes(data.memory.total)}
            </div>
            <div style={{
              backgroundColor: '#e5e7eb',
              height: '8px',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: data.memory.used_percent > 70 ? '#dc2626' : data.memory.used_percent > 50 ? '#ca8a04' : '#16a34a',
                  width: `${data.memory.used_percent}%`,
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* 系统信息 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            系统信息
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>主机名</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                {data.system.hostname}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>操作系统</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                {data.system.os} {data.system.platform_version}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>架构</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                {data.system.architecture}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>进程数</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                {data.system.processes}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// About 页面组件
function AboutPage() {
  return (
    <div style={{
      flex: 1,
      height: '100vh',
      overflow: 'auto',
      backgroundColor: '#f3f4f6',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          margin: '0 0 16px 0',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          📊 About System Monitor
        </h1>
        <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
          跨平台系统监控工具，提供实时的系统性能监控和资源使用情况展示。
        </p>

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            技术栈
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
            <li>Wails v2 - 跨平台桌面应用框架</li>
            <li>React 18 - 用户界面框架</li>
            <li>TypeScript - 类型安全的 JavaScript</li>
            <li>TailwindCSS - 实用优先的 CSS 框架</li>
            <li>gopsutil - 系统信息获取库</li>
          </ul>
        </div>

        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
          <p>版本: 1.0.0</p>
          <p>构建时间: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

// Settings 页面组件
function SettingsPage() {
  return (
    <div style={{
      flex: 1,
      height: '100vh',
      overflow: 'auto',
      backgroundColor: '#f3f4f6',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          margin: '0 0 16px 0',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          ⚙️ Settings
        </h1>
        <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
          配置系统监控的各项设置。
        </p>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            刷新间隔
          </h3>
          <select style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white'
          }}>
            <option value="1000">1 秒</option>
            <option value="2000" selected>2 秒</option>
            <option value="5000">5 秒</option>
            <option value="10000">10 秒</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            主题
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input type="radio" name="theme" value="light" defaultChecked />
              <span style={{ marginLeft: '8px' }}>浅色主题</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input type="radio" name="theme" value="dark" />
              <span style={{ marginLeft: '8px' }}>深色主题</span>
            </label>
          </div>
        </div>

        <button style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          保存设置
        </button>
      </div>
    </div>
  )
}

// 主布局组件
export default function AppLayoutSimple() {
  const [currentPage, setCurrentPage] = useState('monitor')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case 'monitor':
        return <MonitorPage />
      case 'about':
        return <AboutPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <MonitorPage />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1f2937' }}>
      {/* 移动端菜单按钮 */}
      <div style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 50,
        display: window.innerWidth >= 1024 ? 'none' : 'block'
      }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            padding: '8px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isCollapsed ? <Menu className="w-5 h-5 text-gray-600" /> : <X className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      {/* 侧边栏 */}
      <div style={{
        display: isCollapsed && window.innerWidth < 1024 ? 'none' : 'block'
      }}>
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* 主内容区域 */}
      {renderPage()}
    </div>
  )
}