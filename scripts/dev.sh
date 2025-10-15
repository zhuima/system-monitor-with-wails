#!/bin/bash

# 系统监控工具开发脚本

set -e

echo "🛠️ 启动系统监控工具开发环境..."

# 检查依赖
echo "📦 检查依赖..."
if ! command -v wails &> /dev/null; then
    echo "❌ Wails CLI 未安装，请先安装: https://wails.io/docs/gettingstarted/installation"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 Node.js"
    exit 1
fi

# 确保 data 目录存在
mkdir -p data

# 创建默认配置文件
if [ ! -f data/config.yaml ]; then
    echo "📄 创建默认配置文件..."
    cat > data/config.yaml << EOF
# 系统监控工具配置文件
monitoring:
  refresh_interval: 2  # 数据刷新间隔（秒）
  max_processes: 50    # 最大进程数量
  history_retention: 7 # 历史数据保留天数

alerts:
  cpu_threshold: 80     # CPU使用率告警阈值
  memory_threshold: 90  # 内存使用率告警阈值
  disk_threshold: 95    # 磁盘使用率告警阈值

logging:
  level: "debug"        # 开发模式使用debug级别
  file: "data/app.log"  # 日志文件路径

database:
  path: "data/history.db"  # 数据库文件路径
EOF
fi

# 启动开发环境
echo "🚀 启动 Wails 开发环境..."
wails dev