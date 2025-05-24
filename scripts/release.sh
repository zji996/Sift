#!/bin/bash

# Sift 应用发布脚本
# 用法: ./scripts/release.sh [版本号]
# 例如: ./scripts/release.sh v1.0.1

set -e

# 检查是否提供了版本号
if [ $# -eq 0 ]; then
    echo "错误: 请提供版本号"
    echo "用法: $0 <版本号>"
    echo "例如: $0 v1.0.1"
    exit 1
fi

VERSION=$1

# 检查版本号格式
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "错误: 版本号格式不正确"
    echo "正确格式: vX.Y.Z (例如: v1.0.1)"
    exit 1
fi

echo "准备发布 Sift $VERSION"

# 检查当前分支是否是 main 或 master
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo "警告: 当前不在 main/master 分支，当前分支: $CURRENT_BRANCH"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "已取消发布"
        exit 1
    fi
fi

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "错误: 有未提交的更改，请先提交所有更改"
    git status --short
    exit 1
fi

# 获取最新的代码
echo "获取最新代码..."
git pull origin $CURRENT_BRANCH

# 更新 wails.json 中的版本号
echo "更新 wails.json 中的版本..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"productVersion\": \".*\"/\"productVersion\": \"${VERSION#v}\"/" wails.json
else
    # Linux
    sed -i "s/\"productVersion\": \".*\"/\"productVersion\": \"${VERSION#v}\"/" wails.json
fi

# 提交版本更新
echo "提交版本更新..."
git add wails.json
git commit -m "chore: bump version to $VERSION"

# 创建标签
echo "创建标签 $VERSION..."
git tag -a $VERSION -m "Release $VERSION"

# 推送更改和标签
echo "推送到远程仓库..."
git push origin $CURRENT_BRANCH
git push origin $VERSION

echo "✅ 发布成功!"
echo "GitHub Actions 将自动构建并创建 Release"
echo "请前往 GitHub 查看构建进度: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions" 