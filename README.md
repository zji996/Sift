# Sift

一个基于 Wails 构建的强大文件搜索和分析工具。

## 功能特性

- 🌳 **智能文件树浏览** - 直观的目录结构展示，支持快速选择
- 📊 **文件大小分析** - 按大小排序，快速找到大文件
- 🔍 **智能过滤** - 支持多种文件类型过滤和批量选择
- 🤖 **AI 上下文生成** - 为 AI 助手生成结构化的项目信息
- ⚡ **高性能** - 基于 Go 后端，React 前端，优化的渲染性能
- � **现代 UI** - 支持深色/浅色主题切换，流畅的动画效果
- 🔧 **跨平台** - 支持 Windows (x86) 和 macOS (Apple Silicon)

## 技术栈

- **后端**: Go + Wails v2
- **前端**: React + TypeScript + Tailwind CSS
- **构建工具**: Vite
- **UI框架**: 现代化的响应式设计

## 安装和运行

### 前置要求

- Go 1.18+
- Node.js 16+
- Wails CLI v2

### 开发环境

1. 克隆仓库
```bash
git clone https://github.com/zji996/Sift.git
cd Sift
```

2. 安装依赖
```bash
wails build
```

3. 运行开发模式
```bash
wails dev
```

### 构建发布版本

```bash
wails build
```

编译后的可执行文件将位于 `build/bin/` 目录中。

## 截图

*截图将展示在 `screenshots/` 目录中*

## 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 作者

- **zji** - [zji996](https://github.com/zji996)

## 致谢

- 感谢 [Wails](https://wails.io) 提供的优秀框架
- 感谢所有为此项目做出贡献的开发者
