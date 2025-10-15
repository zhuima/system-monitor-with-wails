import React, { useState } from 'react'
import {
  Settings as SettingsIcon,
  Monitor,
  Bell,
  RefreshCw,
  Clock,
  Zap,
  Eye,
  Volume2,
  Save,
  RotateCcw
} from 'lucide-react'

interface SettingsConfig {
  refreshInterval: number
  autoRefresh: boolean
  theme: 'light' | 'dark' | 'auto'
  showNotifications: boolean
  playSoundAlerts: boolean
  enableDesktopNotifications: boolean
  language: 'zh-CN' | 'en-US'
  dataRetention: number
  maxProcesses: number
  cpuThreshold: number
  memoryThreshold: number
  diskThreshold: number
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsConfig>({
    refreshInterval: 2000,
    autoRefresh: true,
    theme: 'auto',
    showNotifications: true,
    playSoundAlerts: false,
    enableDesktopNotifications: false,
    language: 'zh-CN',
    dataRetention: 7,
    maxProcesses: 50,
    cpuThreshold: 80,
    memoryThreshold: 80,
    diskThreshold: 90
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSettingChange = (key: keyof SettingsConfig, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 这里应该调用API保存设置
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      refreshInterval: 2000,
      autoRefresh: true,
      theme: 'auto',
      showNotifications: true,
      playSoundAlerts: false,
      enableDesktopNotifications: false,
      language: 'zh-CN',
      dataRetention: 7,
      maxProcesses: 50,
      cpuThreshold: 80,
      memoryThreshold: 80,
      diskThreshold: 90
    })
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          设置
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          配置系统监控的各项参数和偏好设置
        </p>
      </div>

      <div className="space-y-6">
        {/* 通用设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <SettingsIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              通用设置
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 dark:text-white">
                  自动刷新
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  自动获取最新的系统数据
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="font-medium text-gray-900 dark:text-white mb-2 block">
                刷新间隔
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="1000"
                  value={settings.refreshInterval}
                  onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                  className="flex-1"
                  disabled={!settings.autoRefresh}
                />
                <span className="text-gray-900 dark:text-white w-16 text-right">
                  {settings.refreshInterval / 1000}秒
                </span>
              </div>
            </div>

            <div>
              <label className="font-medium text-gray-900 dark:text-white mb-2 block">
                主题
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
          </div>
        </div>

        {/* 告警设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Bell className="w-6 h-6 text-yellow-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              告警设置
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-medium text-gray-900 dark:text-white mb-2 block">
                CPU 使用率阈值 (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={settings.cpuThreshold}
                onChange={(e) => handleSettingChange('cpuThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-medium text-gray-900 dark:text-white mb-2 block">
                内存使用率阈值 (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={settings.memoryThreshold}
                onChange={(e) => handleSettingChange('memoryThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 dark:text-white">
                  显示通知
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  在界面上显示告警通知
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('showNotifications', !settings.showNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重置</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? '保存中...' : '保存设置'}</span>
          </button>
        </div>

        {/* 保存状态提示 */}
        {saveStatus === 'success' && (
          <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
            <Zap className="w-5 h-5" />
            <span>设置保存成功！</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400">
            <Zap className="w-5 h-5" />
            <span>设置保存失败，请重试！</span>
          </div>
        )}
      </div>
    </div>
  )
}