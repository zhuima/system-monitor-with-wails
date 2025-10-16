import React, { useState } from 'react'
import {
  Bell,
  BellRing,
  Plus,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  X,
  RefreshCw,
  Shield,
  Activity,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

// 模拟告警规则数据
const mockAlertRules = [
  {
    id: 1,
    name: 'CPU使用率过高',
    description: 'CPU使用率超过90%时触发告警',
    metric: 'cpu',
    operator: '>',
    threshold: 90,
    severity: 'critical',
    enabled: true,
    created_at: '2024-01-15T10:30:00Z',
    last_triggered: '2024-01-16T14:25:00Z'
  },
  {
    id: 2,
    name: '内存使用率告警',
    description: '内存使用率超过85%时触发告警',
    metric: 'memory',
    operator: '>',
    threshold: 85,
    severity: 'warning',
    enabled: true,
    created_at: '2024-01-14T09:15:00Z',
    last_triggered: '2024-01-16T12:10:00Z'
  },
  {
    id: 3,
    name: '磁盘空间不足',
    description: '磁盘使用率超过80%时触发告警',
    metric: 'disk',
    operator: '>',
    threshold: 80,
    severity: 'warning',
    enabled: false,
    created_at: '2024-01-13T16:45:00Z',
    last_triggered: null
  },
  {
    id: 4,
    name: '网络流量异常',
    description: '网络流量超过100MB/s时触发告警',
    metric: 'network',
    operator: '>',
    threshold: 100,
    severity: 'info',
    enabled: true,
    created_at: '2024-01-12T11:20:00Z',
    last_triggered: '2024-01-15T18:30:00Z'
  }
]

// 模拟告警记录数据
const mockAlerts = [
  {
    id: 1,
    rule_name: 'CPU使用率过高',
    message: 'CPU使用率达到95.2%，超过阈值90%',
    severity: 'critical',
    status: 'resolved',
    triggered_at: '2024-01-16T14:25:00Z',
    resolved_at: '2024-01-16T14:35:00Z',
    value: 95.2,
    threshold: 90
  },
  {
    id: 2,
    rule_name: '内存使用率告警',
    message: '内存使用率达到87.8%，超过阈值85%',
    severity: 'warning',
    status: 'active',
    triggered_at: '2024-01-16T12:10:00Z',
    resolved_at: null,
    value: 87.8,
    threshold: 85
  },
  {
    id: 3,
    rule_name: '网络流量异常',
    message: '网络流量达到125.6MB/s，超过阈值100MB/s',
    severity: 'info',
    status: 'resolved',
    triggered_at: '2024-01-15T18:30:00Z',
    resolved_at: '2024-01-15T19:00:00Z',
    value: 125.6,
    threshold: 100
  }
]

const metrics = [
  { key: 'cpu', label: 'CPU使用率', icon: Cpu, unit: '%' },
  { key: 'memory', label: '内存使用率', icon: MemoryStick, unit: '%' },
  { key: 'disk', label: '磁盘使用率', icon: HardDrive, unit: '%' },
  { key: 'network', label: '网络流量', icon: Network, unit: 'MB/s' }
]

const severities = [
  { value: 'info', label: '信息', color: 'blue' },
  { value: 'warning', label: '警告', color: 'yellow' },
  { value: 'critical', label: '严重', color: 'red' }
]

const operators = [
  { value: '>', label: '大于' },
  { value: '<', label: '小于' },
  { value: '=', label: '等于' },
  { value: '>=', label: '大于等于' },
  { value: '<=', label: '小于等于' }
]

export default function Alerts() {
  const [activeTab, setActiveTab] = useState<'rules' | 'alerts'>('rules')
  const [alertRules, setAlertRules] = useState(mockAlertRules)
  const [alerts, setAlerts] = useState(mockAlerts)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    metric: 'cpu',
    operator: '>',
    threshold: 80,
    severity: 'warning',
    enabled: true
  })

  const handleCreateRule = () => {
    if (!newRule.name.trim()) return

    const rule = {
      id: Date.now(),
      ...newRule,
      created_at: new Date().toISOString(),
      last_triggered: null
    }

    setAlertRules([...alertRules, rule])
    setNewRule({
      name: '',
      description: '',
      metric: 'cpu',
      operator: '>',
      threshold: 80,
      severity: 'warning',
      enabled: true
    })
    setShowCreateModal(false)
  }

  const handleUpdateRule = () => {
    if (!editingRule || !newRule.name.trim()) return

    setAlertRules(alertRules.map(rule =>
      rule.id === editingRule.id
        ? { ...rule, ...newRule }
        : rule
    ))

    setEditingRule(null)
    setNewRule({
      name: '',
      description: '',
      metric: 'cpu',
      operator: '>',
      threshold: 80,
      severity: 'warning',
      enabled: true
    })
    setShowCreateModal(false)
  }

  const handleDeleteRule = (id: number) => {
    setAlertRules(alertRules.filter(rule => rule.id !== id))
  }

  const handleToggleRule = (id: number) => {
    setAlertRules(alertRules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      critical: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
    }
    return colors[severity as keyof typeof colors] || colors.info
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getMetricIcon = (metric: string) => {
    const metricData = metrics.find(m => m.key === metric)
    const Icon = metricData?.icon || Activity
    return <Icon className="w-4 h-4" />
  }

  const filteredRules = alertRules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = !severityFilter || alert.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            告警管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            配置告警规则，监控系统异常状态
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <button
            onClick={() => {
              setEditingRule(null)
              setNewRule({
                name: '',
                description: '',
                metric: 'cpu',
                operator: '>',
                threshold: 80,
                severity: 'warning',
                enabled: true
              })
              setShowCreateModal(true)
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建规则
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总规则数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{alertRules.length}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">活跃规则</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {alertRules.filter(r => r.enabled).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">活跃告警</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {alerts.filter(a => a.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">今日告警</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {alerts.filter(a => new Date(a.triggered_at).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <BellRing className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>告警规则</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>告警记录</span>
                {alerts.filter(a => a.status === 'active').length > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                    {alerts.filter(a => a.status === 'active').length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 搜索和筛选 */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={activeTab === 'rules' ? '搜索告警规则...' : '搜索告警记录...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {activeTab === 'alerts' && (
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">所有级别</option>
                {severities.map(severity => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeTab === 'rules' ? (
            /* 告警规则列表 */
            <div className="space-y-4">
              {filteredRules.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">暂无告警规则</h3>
                  <p>点击"新建规则"创建第一个告警规则</p>
                </div>
              ) : (
                filteredRules.map(rule => (
                  <div key={rule.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${getSeverityColor(rule.severity)}`}>
                          {getMetricIcon(rule.metric)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {rule.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {rule.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>条件: {rule.operator} {rule.threshold}{metrics.find(m => m.key === rule.metric)?.unit}</span>
                            <span>创建: {new Date(rule.created_at).toLocaleDateString('zh-CN')}</span>
                            {rule.last_triggered && (
                              <span>最后触发: {new Date(rule.last_triggered).toLocaleString('zh-CN')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            rule.enabled
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {rule.enabled ? '已启用' : '已禁用'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingRule(rule)
                            setNewRule({
                              name: rule.name,
                              description: rule.description,
                              metric: rule.metric,
                              operator: rule.operator,
                              threshold: rule.threshold,
                              severity: rule.severity,
                              enabled: rule.enabled
                            })
                            setShowCreateModal(true)
                          }}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* 告警记录列表 */
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">暂无告警记录</h3>
                  <p>系统还没有产生任何告警记录</p>
                </div>
              ) : (
                filteredAlerts.map(alert => (
                  <div key={alert.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                          {getStatusIcon(alert.status)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {alert.rule_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>触发时间: {new Date(alert.triggered_at).toLocaleString('zh-CN')}</span>
                            <span>当前值: {alert.value}</span>
                            <span>阈值: {alert.threshold}</span>
                            {alert.resolved_at && (
                              <span>解决时间: {new Date(alert.resolved_at).toLocaleString('zh-CN')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity === 'critical' ? '严重' : alert.severity === 'warning' ? '警告' : '信息'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 创建/编辑规则模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingRule ? '编辑告警规则' : '新建告警规则'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingRule(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  规则名称
                </label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入规则名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  描述
                </label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入规则描述"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    监控指标
                  </label>
                  <select
                    value={newRule.metric}
                    onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {metrics.map(metric => (
                      <option key={metric.key} value={metric.key}>
                        {metric.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    条件
                  </label>
                  <select
                    value={newRule.operator}
                    onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {operators.map(operator => (
                      <option key={operator.value} value={operator.value}>
                        {operator.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    阈值
                  </label>
                  <input
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    严重级别
                  </label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {severities.map(severity => (
                      <option key={severity.value} value={severity.value}>
                        {severity.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newRule.enabled}
                  onChange={(e) => setNewRule({ ...newRule, enabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  启用此规则
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingRule(null)
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={editingRule ? handleUpdateRule : handleCreateRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingRule ? '更新' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}