import React from 'react'
import { Cpu, MemoryStick, Server, Monitor, HardDrive, Network, Battery, Speaker } from 'lucide-react'
import { useHardwareInfo } from '../hooks/useHardware'

export default function Hardware() {
  const { data, isLoading, error } = useHardwareInfo()

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">硬件参数</h1>
            <p className="text-blue-100 text-sm">展示关键硬件型号与版本信息</p>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl">
          获取硬件信息失败：{error}
        </div>
      )}

      {/* 内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 处理器 */}
        <InfoCard icon={<Cpu className="w-5 h-5 text-blue-600" />} title="处理器" loading={isLoading}>
          <ModelRow label="型号" value={data?.processor.model} />
          <ModelRow label="厂商" value={data?.processor.vendor} />
          {data?.processor.version && <ModelRow label="版本" value={data.processor.version} />}
        </InfoCard>

        {/* 内存 */}
        <InfoCard icon={<MemoryStick className="w-5 h-5 text-green-600" />} title="内存" loading={isLoading}>
          <ModelRow label="总容量" value={formatBytes(data?.memory.total_bytes)} />
          {data?.memory.type && <ModelRow label="类型" value={data.memory.type} />}
          {data?.memory.clock_mhz && <ModelRow label="频率" value={`${data.memory.clock_mhz} MHz`} />}
          {data?.memory.modules && data.memory.modules.length > 0 && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {(data.memory.modules || []).slice(0, 2).map((m, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>条{idx + 1}</span>
                  <span>{m.vendor} {m.model} · {formatBytes(m.size_bytes)} {m.clock_mhz ? `· ${m.clock_mhz}MHz` : ''}</span>
                </div>
              ))}
            </div>
          )}
          {(!data?.memory.modules || data.memory.modules.length === 0) && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              未检测到内存条型号/厂商。Linux 上通常需要更高权限（dmidecode）或启用 EDAC 驱动。
            </div>
          )}
        </InfoCard>

        {/* 显卡（lucide未提供Gpu图标，复用Cpu图标） */}
        <InfoCard icon={<Cpu className="w-5 h-5 text-purple-600" />} title="显卡" loading={isLoading}>
          <ModelRow label="型号" value={data?.gpu.model} />
          <ModelRow label="厂商" value={data?.gpu.vendor} />
        </InfoCard>

        {/* 主板 */}
        <InfoCard icon={<Server className="w-5 h-5 text-orange-600" />} title="主板" loading={isLoading}>
          <ModelRow label="型号" value={data?.motherboard.model} />
          <ModelRow label="厂商" value={data?.motherboard.vendor} />
          {data?.motherboard.version && <ModelRow label="版本" value={data.motherboard.version} />}
        </InfoCard>

        {/* 显示器 */}
        <InfoCard icon={<Monitor className="w-5 h-5 text-indigo-600" />} title="显示器" loading={isLoading}>
          <ModelRow label="型号" value={data?.display.model || '未知'} />
          <ModelRow label="分辨率" value={data?.display.resolution || '未知'} />
          {data?.display.refresh_rate && <ModelRow label="刷新率" value={`${data.display.refresh_rate} Hz`} />}
        </InfoCard>

        {/* 主硬盘 */}
        <InfoCard icon={<HardDrive className="w-5 h-5 text-gray-700" />} title="主硬盘" loading={isLoading}>
          <ModelRow label="型号" value={data?.primary_disk.model} />
          <ModelRow label="厂商" value={data?.primary_disk.vendor} />
          <ModelRow label="容量" value={formatBytes(data?.primary_disk.size_bytes)} />
          {data?.primary_disk.type && <ModelRow label="类型" value={data.primary_disk.type} />}
        </InfoCard>

        {/* 网卡 */}
        <InfoCard icon={<Network className="w-5 h-5 text-teal-600" />} title="网卡" loading={isLoading}>
          <ModelRow label="型号" value={data?.nic.model} />
          <ModelRow label="厂商" value={data?.nic.vendor} />
        </InfoCard>

        {/* 电池 */}
        <InfoCard icon={<Battery className="w-5 h-5 text-amber-600" />} title="电池" loading={isLoading}>
          <ModelRow label="型号" value={data?.battery.model} />
          <ModelRow label="厂商" value={data?.battery.vendor} />
          <ModelRow label="存在" value={data?.battery.present ? '是' : '否'} />
          {typeof data?.battery.percentage === 'number' && <ModelRow label="电量" value={`${data!.battery.percentage}%`} />}
          {data?.battery.status && <ModelRow label="状态" value={data.battery.status} />}
        </InfoCard>

        {/* 声卡 */}
        <InfoCard icon={<Speaker className="w-5 h-5 text-pink-600" />} title="声卡" loading={isLoading}>
          <ModelRow label="型号" value={data?.audio.model} />
          <ModelRow label="厂商" value={data?.audio.vendor} />
        </InfoCard>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, children, loading }: { icon: React.ReactNode; title: string; children: React.ReactNode; loading?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{icon}</div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {loading && <span className="ml-auto text-xs text-gray-500">加载中...</span>}
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  )
}

function ModelRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value ?? '未知'}</span>
    </div>
  )
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return '未知'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(1)} ${units[i]}`
}