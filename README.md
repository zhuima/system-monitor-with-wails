# 系统监控工具 (System Monitor)

基于 Wails + gopsutil + React + TailwindCSS 构建的跨平台系统监控工具。

## 技术栈

- **后端**: Go 1.21 + Wails v2 + gopsutil v3
- **前端**: React 18 + TypeScript + Vite
- **样式**: TailwindCSS 3.x
- **状态管理**: Zustand + React Query
- **图表**: Chart.js (计划中)

## 功能特性

- ✅ **实时系统监控**: CPU、内存、磁盘、网络使用率
- ✅ **现代化UI**: 响应式设计，支持暗色/亮色主题
- ✅ **跨平台**: Windows、macOS、Linux
- 🚧 **进程管理**: 进程列表、排序、过滤、终止
- 🚧 **历史数据**: 性能趋势图表
- 🚧 **告警系统**: 自定义告警规则和通知
- 🚧 **配置管理**: 灵活的配置选项

## 项目结构

```
system-monitor/
├── main.go                    # Wails应用入口
├── go.mod                     # Go依赖管理
├── wails.json                 # Wails配置
├── docs/                      # 项目文档
│   ├── requirements.md        # 需求文档
│   └── architecture.md        # 架构文档
├── backend/                   # 后端代码
│   ├── models/                # 数据模型
│   ├── services/              # 业务服务
│   └── utils/                 # 工具函数
├── frontend/                  # 前端代码
│   ├── src/
│   │   ├── components/        # React组件
│   │   ├── pages/             # 页面组件
│   │   ├── hooks/             # 自定义Hooks
│   │   ├── services/          # API服务
│   │   ├── stores/            # 状态管理
│   │   ├── types/             # TypeScript类型
│   │   └── styles/            # 样式文件
│   ├── package.json           # 前端依赖
│   └── tailwind.config.js     # TailwindCSS配置
├── scripts/                   # 构建脚本
│   ├── build.sh               # 生产构建
│   └── dev.sh                 # 开发环境
└── data/                      # 数据目录
    └── config.yaml            # 配置文件
```

## 开发环境要求

- **Go**: 1.21 或更高版本
- **Node.js**: 18.0 或更高版本
- **Wails CLI**: v2.10.0 或更高版本
- **npm**: 9.0 或更高版本

## 安装步骤

### 1. 安装 Wails CLI

```bash
# 使用 npm 安装
npm install -g @wailsapp/cli

# 或者使用 go install
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 2. 安装前端依赖

```bash
cd frontend
npm install
cd ..
```

### 3. 给脚本添加执行权限

```bash
chmod +x scripts/*.sh
```

## 运行项目

### 开发模式

```bash
# 启动开发环境（自动构建和热重载）
./scripts/dev.sh

# 或者直接使用 wails 命令
wails dev
```

### 生产构建

```bash
# 构建生产版本
./scripts/build.sh

# 或者直接使用 wails 命令
wails build
```

## 项目状态

这是一个正在开发中的项目，当前状态：

### ✅ 已完成
- [x] 项目架构设计和文档
- [x] Wails项目初始化和配置
- [x] 基础UI框架和组件
- [x] 响应式布局和主题切换
- [x] 系统数据获取和显示
- [x] 实时数据更新机制

### 🚧 开发中
- [ ] 图表组件和可视化
- [ ] 进程管理功能
- [ ] 历史数据存储和查询
- [ ] 告警系统实现
- [ ] 配置管理界面

### 📋 计划中
- [ ] 数据导出功能
- [ ] 多语言支持
- [ ] 性能优化
- [ ] 单元测试
- [ ] 打包分发

## 开发指南

### 后端开发

1. **添加新的数据模型**: 在 `backend/models/` 目录下创建新的模型文件
2. **实现业务逻辑**: 在 `backend/services/` 目录下添加服务
3. **配置管理**: 修改 `backend/utils/config.go` 添加新的配置项
4. **绑定方法**: 在 `main.go` 中绑定新的方法到前端

### 前端开发

1. **添加新页面**: 在 `frontend/src/pages/` 目录下创建页面组件
2. **创建组件**: 在 `frontend/src/components/` 目录下添加组件
3. **状态管理**: 在 `frontend/src/stores/` 目录下管理状态
4. **API调用**: 在 `frontend/src/services/api.ts` 中添加API方法

### 样式指南

- 使用 TailwindCSS 原子类
- 遵循响应式设计原则
- 支持暗色模式
- 使用语义化的颜色变量

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目链接: [https://github.com/yourusername/system-monitor](https://github.com/yourusername/system-monitor)
- 问题反馈: [Issues](https://github.com/yourusername/system-monitor/issues)

## 致谢

- [Wails](https://wails.io/) - 跨平台桌面应用框架
- [gopsutil](https://github.com/shirou/gopsutil) - 系统监控库
- [React](https://reactjs.org/) - 用户界面库
- [TailwindCSS](https://tailwindcss.com/) - CSS框架
- [Lucide](https://lucide.dev/) - 图标库