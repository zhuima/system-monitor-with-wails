import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App-simple'

// 最简单的 React 应用入口
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)