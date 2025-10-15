import React from 'react'
import ReactDOM from 'react-dom/client'
import TestSimple from './test-simple'

// 测试入口 - 使用最简单的组件
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestSimple />
  </React.StrictMode>
)