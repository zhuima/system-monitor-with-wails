#!/bin/bash

# 修复版本的构建脚本
# 专门解决 index.html 引用问题

set -e

echo "🔧 使用修复构建脚本..."

# 1. 清理
echo "🧹 清理构建文件..."
rm -rf frontend/dist build/bin

# 2. 构建前端
echo "📦 构建前端..."
cd frontend
npm run build

# 3. 修复 index.html 引用问题
echo "🔧 修复 index.html 引用..."
cd dist

# 获取实际生成的 JS 文件名
MAIN_JS_FILE=$(ls assets/main-*.js | head -1)
CSS_FILE=$(ls assets/index-*.css | head -1 2>/dev/null || echo "")

if [ -z "$MAIN_JS_FILE" ]; then
    echo "❌ 找不到主 JS 文件"
    exit 1
fi

echo "📝 找到主 JS 文件: $MAIN_JS_FILE"

# 修复 index.html
sed -i "s|<script type=\"module\" src=\"/src/main.tsx\"></script>|<script type=\"module\" src=\"/$MAIN_JS_FILE\"></script>|" index.html

# 如果有 CSS 文件，也添加引用
if [ ! -z "$CSS_FILE" ]; then
    echo "📝 找到 CSS 文件: $CSS_FILE"
    if ! grep -q "link rel=\"stylesheet\"" index.html; then
        sed -i "s|</head>|    <link rel=\"stylesheet\" href=\"/$CSS_FILE\">\n</head>|" index.html
    fi
fi

echo "✅ index.html 修复完成"
cat index.html

cd ../..

# 4. 构建 Windows 应用
echo "🪟 构建 Windows 应用..."
wails build -tags "webview2 embed" -platform windows/amd64 -o dist-windows/system-monitor-fixed.exe

# 5. 移动文件
if [ -f "build/bin/dist-windows/system-monitor-fixed.exe" ]; then
    mkdir -p dist-windows
    mv build/bin/dist-windows/system-monitor-fixed.exe dist-windows/
    echo "✅ 构建完成：dist-windows/system-monitor-fixed.exe"
else
    echo "❌ 构建失败"
    exit 1
fi

echo "🎉 修复构建完成！"