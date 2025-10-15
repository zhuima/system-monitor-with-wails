#!/bin/bash

# 系统监控工具自动构建脚本
# 确保每次都能生成正确的可执行文件

set -e  # 遇到错误时退出

echo "🚀 开始构建系统监控工具..."

# 检查是否在正确的目录
if [ ! -f "main.go" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 1. 清理之前的构建文件
echo "🧹 清理之前的构建文件..."
rm -rf frontend/dist
rm -rf build/bin

# 2. 进入前端目录并构建
echo "📦 构建前端..."
cd frontend

# 确保依赖已安装
if [ ! -d "node_modules" ]; then
    echo "📥 安装前端依赖..."
    npm install
fi

# 构建前端
echo "🔨 编译前端代码..."
npm run build

# 验证构建结果
if [ ! -f "dist/index.html" ]; then
    echo "❌ 前端构建失败：找不到 dist/index.html"
    exit 1
fi

# 检查 index.html 是否引用了正确的文件
if grep -q "/src/main.tsx" "dist/index.html"; then
    echo "❌ 错误：dist/index.html 仍然引用源文件，构建失败"
    echo "🔍 检查 dist/index.html 内容："
    cat dist/index.html
    exit 1
fi

echo "✅ 前端构建成功"

# 3. 返回根目录并构建 Wails 应用
echo "🔨 构建 Wails 应用..."
cd ..

# 构建 Windows 版本
echo "🪟 构建 Windows 版本..."
wails build -tags "webview2 embed" -platform windows/amd64 -o dist-windows/system-monitor.exe

# 检查构建结果
if [ ! -f "build/bin/dist-windows/system-monitor.exe" ]; then
    echo "❌ Windows 构建失败"
    exit 1
fi

# 移动到主分发目录
mkdir -p dist-windows
mv build/bin/dist-windows/system-monitor.exe dist-windows/

echo "✅ Windows 版本构建完成：dist-windows/system-monitor.exe"

# 4. 显示构建结果
echo ""
echo "🎉 构建完成！"
echo "📁 生成的文件："
ls -la dist-windows/system-monitor.exe

# 5. 显示文件信息
echo ""
echo "📊 文件信息："
file dist-windows/system-monitor.exe
du -h dist-windows/system-monitor.exe

echo ""
echo "✅ 构建成功！可执行文件位于：dist-windows/system-monitor.exe"