import React from 'react'
import ReactDOM from 'react-dom/client'
import AppLayout from './App-layout'
import './styles/monitor.css'

// 主应用入口
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppLayout />
  </React.StrictMode>
)