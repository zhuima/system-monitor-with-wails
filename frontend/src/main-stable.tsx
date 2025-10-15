import React from 'react'
import ReactDOM from 'react-dom/client'
import SystemMonitorStable from './App-stable'

// 稳定版本入口 - 使用内联样式，避免 CSS 问题
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SystemMonitorStable />
  </React.StrictMode>
)