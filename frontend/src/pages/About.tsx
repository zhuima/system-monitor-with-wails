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
  Package,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  BarChart3,
  RefreshCw,
  Download,
  ExternalLink,
  Star,
  GitBranch,
  Clock,
  Heart
} from 'lucide-react'

export default function About() {
  const features = [
    {
      icon: <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: "实时监控",
      description: "实时获取CPU、内存、磁盘和网络使用情况，提供准确的系统性能数据"
    },
    {
      icon: <Monitor className="w-6 h-6 text-green-600 dark:text-green-400" />,
      title: "可视化展示",
      description: "直观的图表和进度条展示系统状态，支持多维度数据可视化"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: "历史数据分析",
      description: "记录和分析历史性能数据，帮助识别系统使用模式和趋势"
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />,
      title: "智能告警",
      description: "自定义告警规则，及时发现系统异常，支持多种通知方式"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      title: "高性能",
      description: "轻量级设计，低资源占用，高响应速度，不影响系统性能"
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "进程管理",
      description: "查看和管理系统进程，支持进程排序、搜索和终止操作"
    }
  ]

  const techStack = [
    {
      name: "Wails v2",
      description: "跨平台桌面应用框架",
      icon: "🚀",
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    },
    {
      name: "Go",
      description: "后端系统监控与数据处理",
      icon: "🔷",
      color: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
    },
    {
      name: "React 18",
      description: "现代前端用户界面",
      icon: "⚛️",
      color: "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400"
    },
    {
      name: "TypeScript",
      description: "类型安全与代码质量",
      icon: "📘",
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    },
    {
      name: "Tailwind CSS",
      description: "实用优先的CSS框架",
      icon: "🎨",
      color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
    },
    {
      name: "Lucide Icons",
      description: "现代图标库",
      icon: "🎯",
      color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
    }
  ]

  const stats = [
    { label: "代码行数", value: "5000+", icon: <Code className="w-5 h-5" /> },
    { label: "支持平台", value: "3", icon: <Monitor className="w-5 h-5" /> },
    { label: "依赖包", value: "20+", icon: <Package className="w-5 h-5" /> },
    { label: "开发时间", value: "2周", icon: <Clock className="w-5 h-5" /> }
  ]

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 页面标题 - 与其他页面保持一致 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            关于应用
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            了解 System Monitor 的技术特性和开发信息
          </p>
        </div>
      </div>

      {/* 应用概览卡片 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
              <Activity className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            System Monitor
          </h1>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            专业级跨平台系统监控工具，提供实时性能监控、智能告警和历史数据分析功能
          </p>
          <div className="flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              <span>版本 1.0.0</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>2025年10月</span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              <span>zhuima</span>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-blue-600 dark:text-blue-400">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 核心功能 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              核心功能特性
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
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
            ))}
          </div>
        </div>
      </div>

      {/* 技术栈 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Code className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              技术栈
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 text-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <div className="text-3xl mb-3">{tech.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tech.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 系统信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 应用信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <Package className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                应用信息
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">应用名称</span>
                <span className="font-medium text-gray-900 dark:text-white">System Monitor</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">版本号</span>
                <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">开发框架</span>
                <span className="font-medium text-gray-900 dark:text-white">Wails v2.10.2</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">构建时间</span>
                <span className="font-medium text-gray-900 dark:text-white">2025-10-16</span>
              </div>
            </div>
          </div>
        </div>

        {/* 支持平台 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <Monitor className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                支持平台
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center mr-3">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Win</span>
                  </div>
                  <span className="text-gray-900 dark:text-white">Windows</span>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">✓ 支持</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/50 rounded flex items-center justify-center mr-3">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Mac</span>
                  </div>
                  <span className="text-gray-900 dark:text-white">macOS</span>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">✓ 支持</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded flex items-center justify-center mr-3">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Lin</span>
                  </div>
                  <span className="text-gray-900 dark:text-white">Linux</span>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">✓ 支持</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 开源信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              开源项目
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              本软件基于MIT许可证开源，可自由使用、修改和分发。欢迎贡献代码、提交Issue或提出改进建议。
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub 仓库</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>联系我们</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 致谢 */}
      <div className="text-center py-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            特别致谢
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            感谢所有开源社区和贡献者的支持！特别感谢 Wails、React、Go、Tailwind CSS 等优秀项目的开发者们。
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Heart className="w-4 h-4 mr-1 text-red-500" />
              <span>用爱构建</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <GitBranch className="w-4 h-4 mr-1" />
              <span>持续迭代</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

