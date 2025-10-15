import React from 'react'
import {
  Activity,
  Github,
  Mail,
  Globe,
  Code,
  Zap,
  Shield,
  Monitor,
  Calendar,
  User,
  Package
} from 'lucide-react'

export default function About() {
  const features = [
    {
      icon: <Activity className="w-5 h-5 text-blue-600" />,
      title: "实时监控",
      description: "实时获取CPU、内存、磁盘和网络使用情况"
    },
    {
      icon: <Monitor className="w-5 h-5 text-green-600" />,
      title: "可视化展示",
      description: "直观的图表和进度条展示系统状态"
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      title: "高性能",
      description: "轻量级设计，低资源占用，高响应速度"
    },
    {
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      title: "安全可靠",
      description: "本地运行，数据安全，无需网络连接"
    }
  ]

  const techStack = [
    { name: "Wails", description: "跨平台桌面应用框架", icon: "🚀" },
    { name: "Go", description: "后端系统监控", icon: "🔷" },
    { name: "React", description: "前端用户界面", icon: "⚛️" },
    { name: "TypeScript", description: "类型安全", icon: "📘" },
    { name: "Tailwind CSS", description: "样式框架", icon: "🎨" },
    { name: "Lucide Icons", description: "图标库", icon: "🎯" }
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Activity className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            System Monitor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            跨平台系统监控工具
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-1" />
              <span>版本 1.0.0</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>2025年10月</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>zhuima</span>
            </div>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            核心功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 技术栈 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            技术栈
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                <div className="text-2xl mb-2">{tech.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{tech.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 系统信息 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            系统信息
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">应用信息</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">应用名称</span>
                    <span className="text-gray-900 dark:text-white">System Monitor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">版本号</span>
                    <span className="text-gray-900 dark:text-white">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">开发框架</span>
                    <span className="text-gray-900 dark:text-white">Wails v2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">构建时间</span>
                    <span className="text-gray-900 dark:text-white">2025-10-15</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">支持平台</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Windows</span>
                    <span className="text-green-600 dark:text-green-400">✓ 支持</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">macOS</span>
                    <span className="text-green-600 dark:text-green-400">✓ 支持</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Linux</span>
                    <span className="text-green-600 dark:text-green-400">✓ 支持</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">开源许可</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              本软件基于MIT许可证开源，可自由使用、修改和分发。
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a
                href="mailto:contact@example.com"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Mail className="w-5 h-5" />
                <span>联系我们</span>
              </a>
              <a
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Globe className="w-5 h-5" />
                <span>官网</span>
              </a>
            </div>
          </div>
        </div>

        {/* 致谢 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            感谢所有开源社区和贡献者的支持！
          </p>
        </div>
      </div>
    </div>
  )
}