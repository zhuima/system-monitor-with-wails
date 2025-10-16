import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000, // 30 seconds
    },
  },
})

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Frontend Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              应用启动失败
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              正在尝试恢复...
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 专业的开屏动画组件
function SplashScreen() {
  const [mounted, setMounted] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [loadingState, setLoadingState] = useState('initializing') // 'initializing' | 'connecting' | 'loading-data' | 'ready'

  useEffect(() => {
    setMounted(true)

    // 模拟加载阶段，让动画更丰富
    const initializingTimer = setTimeout(() => {
      setLoadingState('connecting')
    }, 600)

    const connectingTimer = setTimeout(() => {
      setLoadingState('loading-data')
    }, 1200)

    const readyTimer = setTimeout(() => {
      setLoadingState('ready')
    }, 2000)

    // 纯开屏动画，固定2.5秒，营造专业感
    const completeTimer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('splash-complete'))
      }, 500)
    }, 2500)

    return () => {
      clearTimeout(initializingTimer)
      clearTimeout(connectingTimer)
      clearTimeout(readyTimer)
      clearTimeout(completeTimer)
    }
  }, [])

  if (fadeOut) {
    return null
  }

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 z-50 flex items-center justify-center transition-opacity duration-500 ${
      mounted ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 左上角装饰 */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl animate-pulse animation-delay-200"></div>

        {/* 右下角装饰 */}
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl animate-pulse animation-delay-400"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl animate-pulse animation-delay-600"></div>

        {/* 中心装饰 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 text-center text-white">
        {/* Logo 动画 */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            {/* Logo 圆环 */}
            <div className="w-24 h-24 border-4 border-white/30 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-2xl">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-4v2m0 4h-7a2 2 0 01-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2V7z"
                  />
                </svg>
              </div>
            </div>

            {/* 环绕的粒子 */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-white/60 rounded-full animate-ping animation-delay-300"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white/40 rounded-full animate-ping animation-delay-500"></div>
            <div className="absolute top-0 -right-3 w-2 h-2 bg-white/80 rounded-full animate-ping animation-delay-700"></div>
            <div className="absolute -top-3 -left-3 w-3 h-3 bg-white/50 rounded-full animate-ping animation-delay-900"></div>
          </div>
        </div>

        {/* 标题动画 */}
        <div className="space-y-4 mb-8">
          <h1 className="text-5xl font-bold tracking-tight animate-pulse">
            系统监控
          </h1>
          <div className="h-1 w-48 bg-white/20 rounded-full overflow-hidden animate-pulse">
            <div className="h-full bg-white/60 rounded-full animate-[slide-left]"></div>
          </div>
          <p className="text-xl text-white/80 font-light animate-fade-in-up animation-delay-500">
            System Monitor v1.0.0
          </p>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center justify-center space-x-4 text-white/90">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              loadingState === 'ready' ? 'bg-green-400' :
              loadingState === 'loading-data' ? 'bg-yellow-400' :
              loadingState === 'connecting' ? 'bg-blue-400' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium animate-fade-in-up animation-delay-700">
              {loadingState === 'ready' ? '系统就绪' :
               loadingState === 'loading-data' ? '加载数据' :
               loadingState === 'connecting' ? '连接服务' : '初始化中'}
            </span>
          </div>
          <div className="h-px w-px bg-white/30 animate-pulse"></div>
          <div className="flex items-center space-x-2 animate-fade-in-up animation-delay-900">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              loadingState === 'ready' ? 'bg-green-400 animate-none' : 'bg-blue-400'
            }`}></div>
            <span className="text-sm font-medium">
              {loadingState === 'ready' ? '完成' : '进行中'}
            </span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-8 w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${
              loadingState === 'ready' ? 'from-green-400 to-green-600' :
              loadingState === 'loading-data' ? 'from-yellow-400 via-orange-500 to-red-500' :
              loadingState === 'connecting' ? 'from-blue-400 via-indigo-500 to-purple-600' :
              'from-gray-400 to-gray-500'
            }`}
            style={{
              width: loadingState === 'ready' ? '100%' :
                     loadingState === 'loading-data' ? '75%' :
                     loadingState === 'connecting' ? '40%' : '15%',
              transition: 'width 1s ease-out, background-color 0.5s ease'
            }}
          ></div>
        </div>

        {/* 加载提示 */}
        <div className="mt-6 text-sm text-white/70">
          <div className="flex items-center justify-center space-x-2">
            {loadingState !== 'ready' ? (
              <>
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce animation-delay-400"></div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-400 font-medium">启动完成</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加CSS动画定义 */}
      <style jsx>{`
        @keyframes slide-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-[slide-left] {
          animation: slide-left 1.5s ease-in-out infinite;
        }
        .animate-[slide-right] {
          animation: slide-right 2s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-700 { animation-delay: 700ms; }
        .animation-delay-900 { animation-delay: 900ms; }
      `}</style>
    </div>
  )
}

// 带开屏动画的App组件
function DelayedApp() {
  const [showSplash, setShowSplash] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // 监听开屏动画完成事件
    const handleSplashComplete = () => {
      setShowSplash(false)
      console.log('🎬 开屏动画完成，立即显示主界面')
      // 立即开始淡入主界面
      setTimeout(() => {
        setFadeOut(true)
      }, 50)
    }

    window.addEventListener('splash-complete', handleSplashComplete)

    return () => {
      window.removeEventListener('splash-complete', handleSplashComplete)
    }
  }, [])

  // 显示开屏动画，然后立即显示主应用
  return (
    <>
      {showSplash && <SplashScreen />}
      {!showSplash && (
        <div className={`min-h-screen transition-opacity duration-300 ${
          fadeOut ? 'opacity-100' : 'opacity-0'
        }`}>
          <App />
        </div>
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DelayedApp />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)