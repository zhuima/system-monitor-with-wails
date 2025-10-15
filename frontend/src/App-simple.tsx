import React, { useEffect, useState } from 'react'

// 最简单的 React 应用
function App() {
  const [message, setMessage] = useState('正在加载...')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    // 测试基本的 React 功能
    setMessage('✅ React 应用运行正常！')

    // 实时更新时间
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '30px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '2.5em' }}>🚀 System Monitor</h1>
        <div style={{ fontSize: '1.5em', margin: '10px 0' }}>{message}</div>
        <div style={{ fontSize: '1.2em', opacity: 0.8, margin: '10px 0' }}>
          当前时间: {time.toLocaleString()}
        </div>
        <div style={{ margin: '20px 0' }}>
          <button
            onClick={() => alert('按钮点击正常！')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            测试按钮
          </button>
        </div>
        <div style={{ fontSize: '0.9em', opacity: 0.7, marginTop: '20px' }}>
          构建版本: 简化测试版<br />
          React: {React.version}<br />
          构建时间: {new Date().toISOString()}
        </div>
      </div>
    </div>
  )
}

export default App