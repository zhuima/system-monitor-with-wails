#!/bin/bash

# Windows 平台专用构建脚本
# 解决闪退问题的优化构建

echo "🚀 开始构建 Windows 版本..."

# 清理之前的构建
echo "🧹 清理构建目录..."
rm -rf build/bin/

# 设置环境变量
export CGO_ENABLED=1
export GOOS=windows
export GOARCH=amd64

# 构建前端
echo "📦 构建前端..."
cd frontend
npm install
npm run build
cd ..

# 使用优化的构建参数
echo "🔨 构建应用程序..."
wails build \
  --platform windows/amd64 \
  --clean \
  --ldflags "-s -w -H windowsgui" \
  --tags "production" \
  --webview2 download \
  --noupx \
  --skipbindings \
  --devtools

echo "✅ 构建完成！"
echo "📁 输出目录: build/bin/"

# 检查构建结果
if [ -f "build/bin/system-monitor.exe" ]; then
    echo "🎉 构建成功！可执行文件已生成"
    ls -la build/bin/
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi