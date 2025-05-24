# Sift 项目文件结构说明

## 📁 根目录文件

### 核心配置文件
- **`wails.json`** - Wails框架配置文件，定义应用名称、构建命令等
- **`go.mod`** - Go模块依赖管理文件
- **`go.sum`** - Go依赖版本锁定文件
- **`package.json`** - 根级npm配置（主要用于全局脚本）
- **`.gitignore`** - Git忽略规则

### Go 后端源码
- **`main.go`** - 应用程序入口点，Wails应用初始化
- **`app.go`** - 主应用结构体，包含暴露给前端的方法
- **`types.go`** - Go类型定义（DirectoryEntry, FileContentResponse等）
- **`filetree.go`** - 文件系统遍历逻辑，**集成.gitignore规则和默认忽略模式**
- **`filecontent.go`** - 文件内容读取，**智能二进制文件检测、无用文件类型过滤和文件大小限制**

### 构建产物
- **`Sift.exe`** - Windows平台的可执行文件（构建后生成）

## 📁 frontend/ 目录 - React前端

### 根配置文件
- **`package.json`** - 前端依赖和脚本配置
- **`package-lock.json`** - 前端依赖版本锁定文件
- **`vite.config.ts`** - Vite构建工具配置
- **`tailwind.config.js`** - TailwindCSS样式框架配置
- **`tsconfig.json`** - TypeScript编译配置
- **`tsconfig.node.json`** - Node.js环境的TypeScript配置
- **`index.html`** - HTML入口文件

### 源代码目录 (src/)
src/
├── App.tsx # 主应用组件，包含所有业务逻辑
├── main.tsx # React应用入口点
├── style.css # 全局样式文件
├── vite-env.d.ts # Vite环境类型定义
├── types/
│ └── index.ts # TypeScript接口定义
├── components/
│ └── DirectoryTreeNode.tsx # 可折叠目录树组件
│ └── FilterPanel.tsx # 智能过滤面板
│ └── Toast.tsx # 消息通知组件
│ └── ... # 其他UI组件
├── hooks/
│ └── useToast.ts # Toast状态管理Hook
├── utils/
│ └── formatUtils.ts # 格式化工具函数
└── assets/
├── fonts/ # 字体文件（Nunito字体）
└── images/ # 图片资源

### 构建产物
- **`dist/`** - Vite构建输出目录（构建后生成）

### Wails集成
- **`wailsjs/`** - Wails自动生成的JS绑定文件

## 📁 build/ 目录 - 构建配置

### 跨平台构建资源
- **`appicon.png`** - 应用图标源文件
- **`README.md`** - 构建目录说明

### macOS构建配置 (darwin/)
- **`Info.plist`** - macOS应用信息配置（生产环境）
- **`Info.dev.plist`** - macOS应用信息配置（开发环境）

### Windows构建配置 (windows/)
- **`icon.ico`** - Windows应用图标
- **`info.json`** - Windows版本信息
- **`wails.exe.manifest`** - Windows应用清单文件
- **`installer/`** - NSIS安装程序配置
  - **`project.nsi`** - 主安装脚本
  - **`wails_tools.nsh`** - Wails工具宏定义

### 构建输出
- **`bin/`** - 编译后的可执行文件存放目录

## 📁 docs/ 目录 - 项目文档

- **`ANIMATION_OPTIMIZATION.md`** - 动画优化说明
- **`FILE_STRUCTURE.md`** - 文件结构说明（本文档）
- **`OPTIMIZATION_SUMMARY.md`** - 项目优化总结
- **`PROJECT_OVERVIEW.md`** - 项目概览
- **`RELEASE_GUIDE.md`** - 发布指南
- **`TOAST_PROGRESS_FIX.md`** - Toast进度条修复文档
- **`UI_IMPROVEMENTS.md`** - UI改进总结

## 📁 node_modules/ 目录

前端依赖包目录，由npm自动管理，包含：
- React生态系统包
- TypeScript相关工具
- TailwindCSS及其依赖
- Vite构建工具链

## 🔍 关键文件解析

### 最重要的文件（AI应重点关注）

1.  **`frontend/src/App.tsx`** (387行)
    -   应用的核心业务逻辑
    -   状态管理和用户交互
    -   文件选择和输出生成逻辑
    -   集成智能过滤和Toast系统

2.  **`filetree.go`** (97行)
    -   文件系统遍历的核心算法
    -   `.gitignore`规则和默认忽略模式处理
    -   目录结构递归构建

3.  **`filecontent.go`** (96行)
    -   文件内容读取策略
    -   **二进制文件识别逻辑和无用文件扩展名过滤**
    -   **大文件跳过机制**
    -   批量文件处理

4.  **`types.go`** (25行)
    -   关键数据结构定义
    -   前后端数据交换格式

### 配置文件优先级

1.  **`wails.json`** - 应用级配置
2.  **`frontend/package.json`** - 前端依赖
3.  **`go.mod`** - 后端依赖
4.  **构建配置文件** - 平台特定设置 (`build/`)

### 可以忽略的文件（展示给AI时）

-   `node_modules/` 和 `frontend/node_modules/` - 依赖包，过于庞大
-   `build/bin/` 和 `frontend/dist/` - 编译产物和构建输出
-   `*.exe` - 可执行文件
-   字体和图片文件 (`.ico`, `.png`, `.woff`, etc.) - 通常不影响代码逻辑，且已在后端进行过滤
-   Lock文件 (`package-lock.json` at root and frontend) - **尽管 `.gitignore` 忽略了前端的 `package-lock.json`，但其版本锁定信息对理解依赖环境仍有价值。**

## 📋 给AI的建议阅读顺序

1.  **项目理解阶段**
    -   README.md → PROJECT_OVERVIEW.md → 本文件 (`FILE_STRUCTURE.md`)

2.  **架构理解阶段**
    -   main.go → app.go → types.go

3.  **核心逻辑理解阶段**
    -   filetree.go → filecontent.go
    -   frontend/src/App.tsx

4.  **细节实现阶段**
    -   frontend/src/components/DirectoryTreeNode.tsx
    -   frontend/src/components/FilterPanel.tsx
    -   frontend/src/components/Toast.tsx
    -   frontend/src/hooks/useToast.ts
    -   frontend/src/types/index.ts

5.  **配置理解阶段**
    -   wails.json → go.mod → frontend/package.json