# 系统监控工具 Makefile
# 提供可靠的自动化构建流程

.PHONY: build build-windows build-linux build-darwin dev clean test frontend-build frontend-dev

# 默认目标
build: build-windows

# 构建所有平台
build-all: clean frontend-build build-windows build-linux build-darwin

# Windows 构建
build-windows: frontend-build
	@echo "🪟 构建 Windows 版本..."
	wails build -tags "webview2 embed" -platform windows/amd64 -o dist-windows/system-monitor.exe
	@if [ -f "build/bin/dist-windows/system-monitor.exe" ]; then \
		mkdir -p dist-windows; \
		mv build/bin/dist-windows/system-monitor.exe dist-windows/; \
		echo "✅ Windows 版本构建完成：dist-windows/system-monitor.exe"; \
	else \
		echo "❌ Windows 构建失败"; \
		exit 1; \
	fi

# Linux 构建
build-linux: frontend-build
	@echo "🐧 构建 Linux 版本..."
	wails build -platform linux/amd64 -o dist-linux/system-monitor
	@if [ -f "build/bin/system-monitor" ]; then \
		mkdir -p dist-linux; \
		mv build/bin/system-monitor dist-linux/; \
		echo "✅ Linux 版本构建完成：dist-linux/system-monitor"; \
	else \
		echo "❌ Linux 构建失败"; \
		exit 1; \
	fi

# macOS 构建
build-darwin: frontend-build
	@echo "🍎 构建 macOS 版本..."
	wails build -platform darwin/amd64 -o dist-macos/system-monitor
	@if [ -f "build/bin/system-monitor" ]; then \
		mkdir -p dist-macos; \
		mv build/bin/system-monitor dist-macos/; \
		echo "✅ macOS 版本构建完成：dist-macos/system-monitor"; \
	else \
		echo "❌ macOS 构建失败"; \
		exit 1; \
	fi

# 前端构建
frontend-build:
	@echo "📦 构建前端..."
	@if [ ! -d "frontend/node_modules" ]; then \
		echo "📥 安装前端依赖..."; \
		cd frontend && npm install; \
	fi
	@rm -rf frontend/dist
	@cd frontend && npm run build
	@if [ ! -f "frontend/dist/index.html" ]; then \
		echo "❌ 前端构建失败：找不到 frontend/dist/index.html"; \
		exit 1; \
	fi
	@if grep -q "/src/main.tsx" "frontend/dist/index.html"; then \
		echo "❌ 错误：frontend/dist/index.html 仍然引用源文件"; \
		exit 1; \
	fi
	@echo "✅ 前端构建成功"

# 前端开发
frontend-dev:
	@echo "🚀 启动前端开发服务器..."
	@cd frontend && npm run dev

# Wails 开发模式
dev:
	@echo "🚀 启动 Wails 开发模式..."
	@wails dev

# 清理
clean:
	@echo "🧹 清理构建文件..."
	@rm -rf frontend/dist build/bin dist-windows dist-linux dist-macos
	@echo "✅ 清理完成"

# 完整测试构建
test: clean build-windows
	@echo "✅ 测试构建成功！"

# 快速重新构建（仅限当前平台）
rebuild: clean build

# 显示帮助
help:
	@echo "系统监控工具构建命令："
	@echo ""
	@echo "  build          - 构建 Windows 版本（默认）"
	@echo "  build-all      - 构建所有平台版本"
	@echo "  build-windows  - 构建 Windows 版本"
	@echo "  build-linux    - 构建 Linux 版本"
	@echo "  build-darwin   - 构建 macOS 版本"
	@echo "  frontend-build - 仅构建前端"
	@echo "  frontend-dev   - 启动前端开发服务器"
	@echo "  dev            - 启动 Wails 开发模式"
	@echo "  clean          - 清理所有构建文件"
	@echo "  test           - 完整测试构建"
	@echo "  rebuild        - 清理并重新构建"
	@echo "  help           - 显示此帮助信息"