// 开发环境Mock API - 当wailsjs绑定文件不存在时使用
export const GetSystemData = async (): Promise<any> => {
  // 模拟系统数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        cpu: {
          usage: Math.random() * 100,
          cores: 8,
          frequency: 2.4
        },
        memory: {
          total: 16384,
          used: Math.random() * 16384,
          available: 16384 - (Math.random() * 16384),
          usedPercent: Math.random() * 100
        },
        disk: [
          {
            device: '/dev/sda1',
            mountpoint: '/',
            fstype: 'ext4',
            total: 500000,
            used: Math.random() * 500000,
            free: 500000 - (Math.random() * 500000),
            usedPercent: Math.random() * 100
          }
        ],
        network: [
          {
            interface: 'eth0',
            bytesSent: Math.random() * 1000000,
            bytesRecv: Math.random() * 1000000,
            packetsSent: Math.random() * 10000,
            packetsRecv: Math.random() * 10000
          }
        ]
      })
    }, 100) // 模拟网络延迟
  })
}

export const GetHistoryData = async (metric: string, duration: number): Promise<any> => {
  // 模拟历史数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = []
      const now = Date.now()
      for (let i = 0; i < 60; i++) {
        data.push({
          timestamp: new Date(now - i * 60000),
          value: Math.random() * 100
        })
      }
      resolve(data)
    }, 100)
  })
}

export const GetProcesses = async (sortBy: string, order: string, limit: number): Promise<any[]> => {
  // 模拟进程数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const processes = []
      for (let i = 0; i < Math.min(limit, 50); i++) {
        processes.push({
          pid: Math.floor(Math.random() * 30000) + 1,
          name: ['chrome', 'firefox', 'node', 'systemd', 'bash', 'vim', 'code'][Math.floor(Math.random() * 7)],
          cpu: Math.random() * 100,
          memory: Math.random() * 1000,
          status: 'running',
          startTime: new Date(Date.now() - Math.random() * 86400000)
        })
      }
      resolve(processes)
    }, 100)
  })
}

export const KillProcess = async (pid: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Mock: Killed process ${pid}`)
      resolve()
    }, 50)
  })
}

export const GetAlertRules = async (): Promise<any[]> => {
  // 模拟告警规则
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: 'CPU使用率过高',
          metric: 'cpu',
          operator: '>',
          threshold: 80,
          duration: 300,
          enabled: true,
          actions: [{ type: 'notification', target: 'desktop', level: 'warning' }]
        }
      ])
    }, 100)
  })
}

export const CreateAlertRule = async (rule: any): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock: Created alert rule', rule)
      resolve()
    }, 50)
  })
}

export const UpdateAlertRule = async (rule: any): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock: Updated alert rule', rule)
      resolve()
    }, 50)
  })
}

export const DeleteAlertRule = async (id: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Mock: Deleted alert rule ${id}`)
      resolve()
    }, 50)
  })
}

export const GetAlerts = async (limit: number): Promise<any[]> => {
  // 模拟告警数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          ruleId: 1,
          ruleName: 'CPU使用率过高',
          message: 'CPU使用率达到85%',
          level: 'warning',
          value: 85,
          threshold: 80,
          status: 'active',
          createdAt: new Date()
        }
      ])
    }, 100)
  })
}

export const GetConfig = async (): Promise<any> => {
  // 模拟配置数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        monitoring: {
          interval: 2,
          enabled: true,
          metrics: ['cpu', 'memory', 'disk', 'network']
        },
        logging: {
          level: 'info',
          file: 'system-monitor.log'
        }
      })
    }, 50)
  })
}

export const UpdateConfig = async (config: any): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock: Updated config', config)
      resolve()
    }, 50)
  })
}

export const GetSystemInfo = async (): Promise<any> => {
  // 模拟系统信息
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hostname: 'dev-pc',
        platform: 'linux',
        arch: 'amd64',
        uptime: 86400,
        totalRAM: 16384,
        cpuCores: 8,
        cpuModel: 'Intel Core i7-9700K'
      })
    }, 50)
  })
}