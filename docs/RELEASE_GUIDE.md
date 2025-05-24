# Sift 发布指南

## 概述

Sift 使用 GitHub Actions 进行自动化的跨平台构建和发布。支持以下平台：

- **Windows** (amd64)
- **macOS** (Intel/amd64 和 Apple Silicon/arm64)
- **Linux** (amd64)

## 自动发布流程

### 1. 使用自动脚本发布（推荐）

```bash
# 确保在项目根目录
cd /path/to/Sift

# 运行发布脚本
./scripts/release.sh v1.0.1
```

脚本会自动：
- 验证版本号格式
- 检查工作目录状态
- 更新 `wails.json` 中的版本号
- 创建 git 标签
- 推送到 GitHub
- 触发自动构建

### 2. 手动发布流程

如果你喜欢手动控制每一步：

```bash
# 1. 更新版本号
# 编辑 wails.json，修改 productVersion

# 2. 提交更改
git add wails.json
git commit -m "chore: bump version to v1.0.1"

# 3. 创建标签
git tag -a v1.0.1 -m "Release v1.0.1"

# 4. 推送
git push origin main  # 或 master
git push origin v1.0.1
```

### 3. 手动触发构建

如果需要重新构建某个版本，可以在 GitHub 上手动触发：

1. 前往 GitHub 仓库的 Actions 页面
2. 选择 "Release" workflow
3. 点击 "Run workflow"
4. 输入版本号（如 v1.0.1）
5. 运行

## 构建产物

构建完成后，GitHub Release 会包含以下文件：

| 平台 | 文件名 | 说明 |
|------|--------|------|
| Windows | `Sift-windows-amd64.exe` | Windows 可执行文件 |
| macOS (Intel) | `Sift-darwin-amd64.app.zip` | macOS Intel 应用包 |
| macOS (ARM) | `Sift-darwin-arm64.app.zip` | macOS Apple Silicon 应用包 |
| Linux | `Sift-linux-amd64.tar.gz` | Linux 压缩包 |

## 版本号规范

使用语义化版本控制 (Semantic Versioning)：

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

格式：`vMAJOR.MINOR.PATCH`

示例：
- `v1.0.0` - 首个稳定版本
- `v1.1.0` - 新增功能
- `v1.1.1` - 修复 bug

## 故障排除

### 构建失败

1. **检查 Go 版本**：确保使用 Go 1.23+
2. **检查依赖**：运行 `go mod tidy` 清理依赖
3. **检查前端**：确保 `npm install` 无错误
4. **查看日志**：在 GitHub Actions 页面查看详细错误信息

### macOS 代码签名（可选）

如果需要对 macOS 应用进行代码签名，需要在 GitHub 仓库设置中添加以下 Secrets：

- `APPLE_DEVELOPER_CERTIFICATE_P12_BASE64`: Apple 开发者证书（base64 编码）
- `APPLE_DEVELOPER_CERTIFICATE_PASSWORD`: 证书密码

### Windows 代码签名（可选）

类似地，Windows 代码签名需要：

- `WINDOWS_CERTIFICATE_P12_BASE64`: Windows 代码签名证书
- `WINDOWS_CERTIFICATE_PASSWORD`: 证书密码

## 本地测试构建

在推送标签前，建议先本地测试构建：

```bash
# 安装 Wails CLI
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# 测试构建
wails build --clean

# 跨平台构建测试（需要相应的交叉编译工具链）
wails build --platform linux/amd64 --clean
wails build --platform windows/amd64 --clean
wails build --platform darwin/amd64 --clean
wails build --platform darwin/arm64 --clean
```

## 发布后检查

1. **下载测试**：从 GitHub Release 下载各平台版本
2. **功能测试**：在各平台测试核心功能
3. **更新文档**：更新 README.md 中的下载链接

## 回滚策略

如果发现发布的版本有问题：

1. **删除有问题的 Release**（如果尚未广泛分发）
2. **创建热修复版本**（推荐）：
   ```bash
   # 修复问题后
   ./scripts/release.sh v1.0.2
   ```
3. **回滚到上一个稳定版本**：在 Release 页面标记为 "Latest release"

## 自动化改进建议

1. **添加自动测试**：在构建前运行完整的测试套件
2. **通知机制**：构建完成后发送通知（Slack、邮件等）
3. **安全扫描**：集成安全漏洞扫描
4. **性能监控**：集成性能监控和崩溃报告 