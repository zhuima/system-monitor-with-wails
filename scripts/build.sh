#!/bin/bash

# 系统监控工具构建脚本

set -e

echo "🚀 开始构建系统监控工具..."

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

# 进入前端目录
cd frontend

# 安装前端依赖
echo "📥 安装前端依赖..."
npm ci

# 构建前端
echo "🔨 构建前端..."
npm run build

# 返回根目录
cd ..

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
  level: "info"         # 日志级别 (debug, info, warn, error)
  file: "data/app.log"  # 日志文件路径

database:
  path: "data/history.db"  # 数据库文件路径
EOF
fi

# 构建 Wails 应用
echo "🏗️ 构建 Wails 应用..."
wails build -clean -web -upx

echo "✅ 构建完成！"
echo "📁 可执行文件位置: build/bin"

# 显示构建信息
if [ -d "build/bin" ]; then
    echo "📋 构建的文件："
    ls -la build/bin/ 2>/dev/null || echo "   构建目录为空"
fi