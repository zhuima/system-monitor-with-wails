import React from 'react'
import ReactDOM from 'react-dom/client'
import TestBasic from './test-basic'

// 基础测试入口 - 不依赖任何外部样式
ReactDOM.createRoot(document.getElementById('root')!).render(
  <TestBasic />
)