import React, { useState, useEffect } from 'react'
import { Cpu, MemoryStick, HardDrive, Network, Activity, Settings, Info, Menu, X } from 'lucide-react'

// 模拟系统数据
const mockSystemData = {
  system: {
    hostname: "Windows-PC",
    os: "Windows",
    platform_version: "10.0",
    architecture: "amd64",
    uptime: 123456,
    processes: 156,
    timestamp: new Date().toISOString()
  },
  cpu: {
    model_name: "Intel Core i7-9750H",
    cores: 6,
    logical_cores: 12,
    speed: 2.6,
    usage: 45.2,
    load1: 1.2,
    load5: 1.8,
    load15: 2.1,
    timestamp: new Date().toISOString()
  },
  memory: {
    total: 16777216000,
    used: 8388608000,
    available: 8388608000,
    used_percent: 50.0,
    timestamp: new Date().toISOString()
  },
  disk: [
    {
      device: "C:",
      total: 536870912000,
      used: 214748364800,
      free: 322122547200,
      used_percent: 40.0,
      timestamp: new Date().toISOString()
    }
  ],
  network: [
    {
      name: "Ethernet",
      bytes_sent: 1073741824,
      bytes_recv: 2147483648,
      timestamp: new Date().toISOString()
    }
  ],
  timestamp: new Date().toISOString()
}

// 格式化字节数
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 获取状态颜色
function getStatusColor(value: number, warning: number = 70, critical: number = 90): string {
  if (value >= critical) return '#dc2626'
  if (value >= warning) return '#ca8a04'
  return '#16a34a'
}

// 指标卡片组件
function MetricCard({
  title,
  value,
  unit,
  icon,
  usage,
  warning = 70,
  critical = 90
}: {
  title: string
  value: string | number
  unit: string
  icon: React.ReactNode
  usage?: number
  warning?: number
  critical?: number
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{
          backgroundColor: '#dbeafe',
          padding: '8px',
          borderRadius: '8px',
          marginRight: '12px'
        }}>
          {icon}
        </div>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937'
        }}>{title}</h3>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <span style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: usage ? getStatusColor(usage, warning, critical) : '#1f2937'
        }}>
          {value}
        </span>
        {unit && <span style={{ marginLeft: '4px', color: '#6b7280' }}>{unit}</span>}
      </div>

      {usage !== undefined && (
        <div style={{
          backgroundColor: '#e5e7eb',
          height: '8px',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              backgroundColor: getStatusColor(usage, warning, critical),
              width: `${Math.min(usage, 100)}%`,
              transition: 'all 0.3s ease'
            }}
          />
        </div>
      )}
    </div>
  )
}

// 系统信息组件
function SystemInfo({ system }: { system: typeof mockSystemData.system }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937'
      }}>系统信息</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>主机名</span>
          <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#1f2937' }}>{system.hostname}</p>
        </div>
        <div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>操作系统</span>
          <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#1f2937' }}>{system.os} {system.platform_version}</p>
        </div>
        <div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>架构</span>
          <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#1f2937' }}>{system.architecture}</p>
        </div>
        <div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>进程数</span>
          <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#1f2937' }}>{system.processes}</p>
        </div>
      </div>
    </div>
  )
}

export default function SystemMonitorStable() {
  const [systemData, setSystemData] = useState(mockSystemData)
  const [currentTime, setCurrentTime] = useState(new Date())

  // 实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      // 模拟数据变化
      setSystemData(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: 20 + Math.random() * 60
        },
        memory: {
          ...prev.memory,
          used_percent: 30 + Math.random() * 50
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 头部 */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            🚀 System Monitor
          </h1>
          <p style={{
            margin: '0 0 8px 0',
            color: '#6b7280'
          }}>
            实时监控系统性能和资源使用情况
          </p>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            最后更新: {currentTime.toLocaleString()}
          </div>
        </div>

        {/* 概览卡片 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <MetricCard
            title="CPU 使用率"
            value={systemData.cpu.usage.toFixed(1)}
            unit="%"
            icon={<Cpu style={{ width: '24px', height: '24px', color: '#2563eb' }} />}
            usage={systemData.cpu.usage}
          />
          <MetricCard
            title="内存使用率"
            value={systemData.memory.used_percent.toFixed(1)}
            unit="%"
            icon={<MemoryStick style={{ width: '24px', height: '24px', color: '#16a34a' }} />}
            usage={systemData.memory.used_percent}
          />
          <MetricCard
            title="磁盘使用率"
            value={systemData.disk[0]?.used_percent.toFixed(1) || '0'}
            unit="%"
            icon={<HardDrive style={{ width: '24px', height: '24px', color: '#9333ea' }} />}
            usage={systemData.disk[0]?.used_percent}
          />
          <MetricCard
            title="网络流量"
            value={formatBytes(systemData.network[0]?.bytes_recv || 0)}
            unit=""
            icon={<Network style={{ width: '24px', height: '24px', color: '#ea580c' }} />}
          />
        </div>

        {/* 详细信息 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '16px'
        }}>
          <SystemInfo system={systemData.system} />
        </div>
      </div>
    </div>
  )
}