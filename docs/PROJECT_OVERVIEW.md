# Sift 项目概览 - AI 快速理解指南

## 🎯 项目目标
Sift 是一个专门为开发者设计的桌面工具，主要解决"如何高效地向AI展示代码项目"这一痛点。它能够智能地整理项目文件，生成AI友好的格式化输出。

## 🏗️ 架构概览

### 技术选型
- **框架**: Wails v2 (Go + Web前端的桌面应用框架)
- **后端**: Go 1.21+ 
- **前端**: React 18 + TypeScript + TailwindCSS
- **构建工具**: Vite

### 核心组件

#### 后端 Go 模块
1. **main.go** - 应用入口点，Wails配置
2. **app.go** - 主应用逻辑，绑定到前端的方法
3. **filetree.go** - 文件树遍历，gitignore支持
4. **filecontent.go** - 文件内容读取，二进制检测
5. **types.go** - 数据结构定义

#### 前端 React 组件
1. **App.tsx** - 主应用组件，状态管理
2. **DirectoryTreeNode.tsx** - 可折叠的目录树组件
3. **types/index.ts** - TypeScript类型定义

## 🔄 数据流

```
用户选择目录 → Go后端扫描文件系统 → 生成文件树 → React前端展示
       ↓
用户选择文件 → Go后端读取内容 → 前端格式化输出 → 复制到剪贴板
```

## 🔑 核心功能实现

### 1. 文件系统扫描
- 使用 `os.ReadDir` 递归遍历目录
- 集成 `go-gitignore` 库处理忽略规则
- 按类型和名称排序（目录优先）

### 2. 文件内容处理
- HTTP MIME类型检测识别二进制文件
- 大文件截断保护
- UTF-8编码验证

### 3. 用户界面
- 基于Checkbox的多选文件树
- 实时的文件大小统计
- 响应式设计，支持大型项目

### 4. 输出格式化
生成两种标准化格式：
- `<file_map>` - ASCII艺术风格的目录树
- `<file_contents>` - 带路径标识的文件内容块

## 📦 依赖关系

### Go 依赖 (go.mod)
```go
- github.com/wailsapp/wails/v2  // 主框架
- github.com/sabhiram/go-gitignore  // gitignore解析
```

### 前端依赖 (package.json)
```json
- react, react-dom  // UI框架
- typescript  // 类型安全
- tailwindcss  // 样式框架
- vite  // 构建工具
```

## 🎨 UI/UX 设计原则

1. **简洁性**: 单页面应用，核心功能一目了然
2. **效率性**: 支持全选、批量操作，减少重复点击
3. **可视性**: 文件大小显示，帮助用户做出选择
4. **可靠性**: 错误处理，加载状态，用户反馈

## 🔧 开发环境配置

### 必需工具
- Go 1.21+
- Node.js 18+
- Wails CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### 本地开发
```bash
wails dev  # 热重载开发模式
wails build  # 生产构建
```

## 📝 使用场景举例

### 场景1: 代码审查
开发者想要AI审查他们的React组件：
1. 打开Sift，选择项目目录
2. 只选择 `src/components/` 目录
3. 生成输出，复制给AI
4. AI能看到完整的组件结构和代码

### 场景2: 错误诊断
项目有构建错误，需要AI帮助：
1. 选择配置文件（package.json, tsconfig.json等）
2. 选择相关源代码文件
3. 包含错误日志文件
4. AI获得完整上下文进行诊断

## 🚀 未来改进方向

1. **性能优化**: 大型项目的异步加载
2. **过滤增强**: 更多的智能过滤选项
3. **预设模板**: 常见项目类型的快速选择模板
4. **云同步**: 保存和分享项目配置
5. **插件系统**: 支持自定义输出格式

## 🐛 已知限制

1. 二进制文件检测可能不够准确
2. 非常大的文件可能导致内存问题
3. 深层嵌套目录的性能影响
4. Windows路径分隔符的处理

---

*这个概览文档旨在帮助AI快速理解Sift项目的整体架构和设计思路。如需详细的实现细节，请参考具体的代码文件。* 