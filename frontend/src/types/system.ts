// 系统信息类型定义

export interface SystemInfo {
  hostname: string
  os: string
  platform: string
  platform_family: string
  platform_version: string
  architecture: string
  uptime: number
  boot_time: string
  processes: number
  kernel_version: string
  kernel_arch: string
  timestamp: string
}

export interface CPUInfo {
  model_name: string
  vendor_id: string
  family: string
  model: string
  stepping: string
  cores: number
  logical_cores: number
  speed: number
  cache_size: number
  usage: number
  usage_per_core: number[]
  load1: number
  load5: number
  load15: number
  timestamp: string
}

export interface CPUHistory {
  timestamp: string
  usage: number
  load1: number
  load5: number
  load15: number
  per_core: number[]
}

export interface CPUStats {
  total_usage: number
  user_usage: number
  system_usage: number
  idle_usage: number
  iowait_usage: number
  irq_usage: number
  softirq_usage: number
  steal_usage: number
  guest_usage: number
  timestamp: string
}

export interface MemoryInfo {
  total: number
  available: number
  used: number
  used_percent: number
  free: number
  active: number
  inactive: number
  buffers: number
  cached: number
  write_back: number
  dirty: number
  write_back_tmp: number
  shared: number
  slab: number
  sreclaimable: number
  sunreclaim: number
  page_tables: number
  swap_cached: number
  commit_limit: number
  committed_as: number
  high_total: number
  high_free: number
  low_total: number
  low_free: number
  swap_total: number
  swap_used: number
  swap_free: number
  swap_percent: number
  vmalloc_total: number
  vmalloc_used: number
  vmalloc_chunk: number
  timestamp: string
}

export interface MemoryHistory {
  timestamp: string
  used_percent: number
  swap_percent: number
  available: number
  free: number
  used: number
  swap_used: number
}

export interface SwapInfo {
  total: number
  used: number
  free: number
  used_percent: number
  sin: number
  sout: number
  timestamp: string
}

export interface MemoryStats {
  applications: number
  buffers: number
  cached: number
  swap: number
  total: number
  free: number
  available: number
  pressure: number
  timestamp: string
}

export interface DiskInfo {
  device: string
  mountpoint: string
  fstype: string
  opts: string
  total: number
  free: number
  used: number
  used_percent: number
  label: string
  dev_major: number
  dev_minor: number
  filesystem: string
  io_stats?: DiskIOStats
  timestamp: string
}

export interface DiskIOStats {
  read_count: number
  write_count: number
  read_bytes: number
  write_bytes: number
  read_time: number
  write_time: number
  io_time: number
  weighted_io: number
  name: string
  serial_number: string
  model_number: string
  temperature?: number
  health_status?: string
  timestamp: string
}

export interface DiskHistory {
  timestamp: string
  device: string
  mountpoint: string
  used_percent: number
  free: number
  used: number
  read_bytes: number
  write_bytes: number
  read_time: number
  write_time: number
}

export interface DiskUsageSummary {
  total_devices: number
  total_space: number
  used_space: number
  free_space: number
  overall_usage: number
  critical_devices: number
  warning_devices: number
  timestamp: string
}

export interface NetworkInfo {
  name: string
  hw_addr: string
  mtu: number
  flags: string[]
  addrs: string[]
  bytes_sent: number
  bytes_recv: number
  packets_sent: number
  packets_recv: number
  errin: number
  errout: number
  dropin: number
  dropout: number
  timestamp: string
}

export interface NetworkStatsHistory {
  timestamp: string
  interface: string
  bytes_sent: number
  bytes_recv: number
  packet_sent: number
  packet_recv: number
}

export interface ProcessInfo {
  pid: number
  name: string
  status: string
  ppid: number
  pgid: number
  num_threads: number
  mem_usage: number
  mem_rss: number
  mem_vms: number
  cpu_percent: number
  times: ProcessTimes
  create_time: number
  cwd: string
  exe: string
  cmdline: string
  username: string
  timestamp: string
}

export interface ProcessTimes {
  user: number
  system: number
  idle: number
  nice: number
  iowait: number
  irq: number
  softirq: number
  steal: number
  guest: number
  guestNice: number
}

export interface SystemData {
  system: SystemInfo
  cpu: CPUInfo
  memory: MemoryInfo
  disk: DiskInfo[]
  network: NetworkInfo[]
  processes: ProcessInfo[]
  timestamp: string
}

export interface SystemOverview {
  system_info: SystemInfo
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_speed: number
  process_count: number
  temperature?: number
  timestamp: string
}

export type SystemStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

// 告警相关类型
export interface AlertRule {
  id: number
  name: string
  metric: string
  operator: string
  threshold: number
  duration: number
  enabled: boolean
  actions: AlertAction[]
  created_at: string
  updated_at: string
}

export interface AlertAction {
  type: string
  target: string
  level: string
}

export interface Alert {
  id: number
  rule_id: number
  rule_name: string
  message: string
  level: string
  value: number
  threshold: number
  status: string
  created_at: string
  resolved_at?: string
}

// 配置相关类型
export interface Config {
  monitoring: MonitoringConfig
  alerts: AlertsConfig
  logging: LoggingConfig
  database: DatabaseConfig
  ui: UIConfig
}

export interface MonitoringConfig {
  refresh_interval: number
  max_processes: number
  history_retention: number
  enable_auto_refresh: boolean
  cpu_alert_threshold: number
  memory_alert_threshold: number
  disk_alert_threshold: number
}

export interface AlertsConfig {
  cpu_threshold: number
  memory_threshold: number
  disk_threshold: number
  network_threshold: number
  enable_sounds: boolean
  enable_desktop: boolean
  email_enabled: boolean
  email_recipient: string
  webhook_url: string
}

export interface LoggingConfig {
  level: string
  file: string
  max_size: number
  max_backups: number
  max_age: number
  compress: boolean
  console: boolean
}

export interface DatabaseConfig {
  path: string
  max_connections: number
  connection_timeout: number
  enable_wal: boolean
  page_size: number
  cache_size: number
}

export interface UIConfig {
  theme: string
  language: string
  window_width: number
  window_height: number
  window_maximized: boolean
  show_process_tree: boolean
  refresh_rate: number
  show_hidden_files: boolean
}

// API响应类型
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// 历史数据查询参数
export interface HistoryQuery {
  metric: string
  duration: number // 分钟
  start_time?: string
  end_time?: string
  aggregation?: string // minute, hour, day
}

// 进程查询参数
export interface ProcessQuery {
  sort_by: string
  order: string
  limit: number
  filter?: string
  show_all?: boolean
}

// 图表数据类型
export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
}

export interface ChartDataset {
  label: string
  data: ChartDataPoint[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}