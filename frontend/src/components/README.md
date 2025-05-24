# 组件架构说明

## 概述
本项目已完成组件化重构，实现了低耦合、高内聚的组件架构。所有组件都遵循统一的设计规范和风格。

## 核心组件

### 基础组件 (Base Components)

#### `Button.tsx`
- **功能**: 统一的按钮组件
- **特性**: 
  - 支持多种变体 (primary, secondary, success, info, warning, danger)
  - 支持多种尺寸 (sm, md, lg)
  - 内置加载状态
  - 统一的动画效果

#### `Card.tsx`
- **功能**: 统一的卡片容器组件
- **特性**:
  - 支持标题、图标、操作按钮
  - 玻璃形态效果
  - 可自定义渐变背景
  - 统一的动画效果

#### `LoadingSpinner.tsx`
- **功能**: 加载指示器组件
- **特性**:
  - 支持多种尺寸
  - 可选显示 Logo
  - 自定义加载消息

#### `ThemeToggle.tsx`
- **功能**: 主题切换按钮
- **特性**:
  - 平滑的切换动画
  - 视觉反馈

### 业务组件 (Business Components)

#### `Header.tsx`
- **功能**: 应用顶部工具栏
- **包含**: Logo、主题切换、操作按钮、状态栏
- **职责**: 全局操作和状态显示

#### `StatusBar.tsx`
- **功能**: 状态信息显示
- **显示**: 项目信息、选择统计、错误信息

#### `FileTreePanel.tsx`
- **功能**: 文件树显示面板
- **特性**:
  - 文件树展示
  - 过滤功能
  - 全选/取消全选
  - 加载状态处理

#### `FileSizePanel.tsx`
- **功能**: 文件大小排序面板
- **特性**:
  - 按文件大小排序
  - 文件选择交互
  - 大小格式化显示

#### `OutputPanel.tsx`
- **功能**: 输出结果面板
- **包含**: 文件映射输出、文件内容输出
- **特性**: 独立的复制功能

### 工具组件 (Utility Components)

#### `ParticleBackground.tsx`
- **功能**: 粒子背景效果

#### `EmptyState.tsx`
- **功能**: 空状态展示

#### `Toast.tsx`
- **功能**: 消息提示系统

#### `FilterPanel.tsx`
- **功能**: 智能过滤面板

#### `DirectoryTreeNode.tsx`
- **功能**: 目录树节点组件

## 工具函数

### `utils/formatUtils.ts`
- `formatBytes()`: 字节大小格式化
- `getBaseName()`: 路径基础名称提取

## 设计原则

### 1. 单一职责原则
每个组件只负责一个特定的功能，职责明确。

### 2. 组件复用性
基础组件（Button、Card等）可在多个地方复用，保持一致性。

### 3. 属性传递
通过 props 传递数据和回调函数，避免组件间直接耦合。

### 4. 样式统一
所有组件使用统一的设计系统和 CSS 变量。

### 5. 动画一致性
使用 Framer Motion 提供统一的动画效果。

## 文件结构
```
src/
├── components/
│   ├── Button.tsx           # 按钮组件
│   ├── Card.tsx            # 卡片组件
│   ├── Header.tsx          # 头部组件
│   ├── StatusBar.tsx       # 状态栏组件
│   ├── LoadingSpinner.tsx  # 加载组件
│   ├── ThemeToggle.tsx     # 主题切换
│   ├── FileTreePanel.tsx   # 文件树面板
│   ├── FileSizePanel.tsx   # 文件大小面板
│   ├── OutputPanel.tsx     # 输出面板
│   └── ...                 # 其他组件
├── utils/
│   └── formatUtils.ts      # 格式化工具
└── App.tsx                 # 主应用组件
```

## 使用示例

### 使用 Button 组件
```tsx
<Button
    onClick={handleClick}
    variant="primary"
    size="md"
    loading={isLoading}
>
    点击我
</Button>
```

### 使用 Card 组件
```tsx
<Card
    title="标题"
    icon="🎯"
    headerActions={<Button size="sm">操作</Button>}
    variant="strong"
>
    卡片内容
</Card>
```

## 优势

1. **低耦合**: 组件间通过 props 通信，减少直接依赖
2. **高复用**: 基础组件可在多处使用
3. **易维护**: 每个组件职责单一，便于修改和测试
4. **风格统一**: 使用统一的设计系统
5. **性能优化**: 组件按需加载，减少不必要的重渲染 