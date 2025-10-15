import React from 'react'
import ReactDOM from 'react-dom/client'
import AppLayoutSimple from './App-layout-simple'

// 左右分屏布局版本入口 - 使用内联样式
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppLayoutSimple />
  </React.StrictMode>
)