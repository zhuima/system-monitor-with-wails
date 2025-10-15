import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import Dashboard from './pages/Dashboard'
import Processes from './pages/Processes'
import History from './pages/History'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import { useAppStore } from './stores/appStore'
import { useSystemData } from './hooks/useSystemData'
import Loading from './components/common/Loading'
// import { EventsOn } from '../wailsjs/runtime'

function App() {
  const { theme, systemData, setSystemData, setLoading } = useAppStore()
  const { isLoading, error } = useSystemData()

  // 初始化应用
  useEffect(() => {
    // 监听系统数据更新事件 - 暂时注释掉
    // EventsOn('system-data', (data) => {
    //   setSystemData(data)
    //   setLoading(false)
    // })

    // 监听应用就绪事件 - 暂时注释掉
    // EventsOn('app-ready', (data) => {
    //   console.log('App ready:', data)
    // })

    // 监听告警事件 - 暂时注释掉
    // EventsOn('alert', (alert) => {
    //   console.log('New alert:', alert)
    //   // 这里可以添加告警通知逻辑
    // })

    // 监听错误事件 - 暂时注释掉
    // EventsOn('error', (error) => {
    //   console.error('Backend error:', error)
    //   // 这里可以添加错误处理逻辑
    // })

    // 应用主题
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // 自动主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme, setSystemData, setLoading])

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            加载失败
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            无法连接到后端服务，请检查应用程序是否正常运行。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="processes" element={<Processes />} />
          <Route path="history" element={<History />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App