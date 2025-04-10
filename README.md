# Sift Context Builder

Sift is a desktop application built with Wails (Go + React/TypeScript) designed to help you quickly select relevant files and directories from your project and generate a consolidated context block, perfect for pasting into Large Language Models (LLMs) like ChatGPT, Claude, Gemini, etc.

It intelligently filters files based on your project's `.gitignore` rules, ignores dotfiles/folders (like `.git`, `.vscode`), common dependency directories (`node_modules`), and distinguishes binary files from text files.

---

<details>
<summary>🇬🇧 English README / English Version</summary>

## ✨ Features

*   **Directory Selection:** Easily browse and select your project's root directory.
*   **Filtered File Tree:** Displays a clean file tree view, automatically hiding:
    *   Files and folders specified in your `.gitignore` file.
    *   Dotfiles and dot directories (e.g., `.git`, `.DS_Store`, `.vscode`, `.idea`).
    *   Commonly ignored directories like `node_modules`, `dist`, `build`, `target`.
*   **Selective Inclusion:** Use checkboxes to select specific files or entire directories you want to include in the context.
    *   Selecting/deselecting a directory recursively applies to its children.
    *   Parent directories are automatically selected if a child is selected.
    *   Indeterminate state checkboxes show partial selection within directories.
    *   Root checkbox allows selecting/deselecting all *visible* files/folders.
*   **Context Generation:** Creates a formatted output string containing:
    *   A `<file_map>` section visualizing the structure of *all visible* (non-ignored) files and folders in the project root, respecting `.gitignore`.
    *   A `<file_contents>` section including the content of *only the selected* files.
    *   Automatic language detection for syntax highlighting hints in markdown code blocks (e.g., ```go).
    *   Exclusion of content for detected binary files (e.g., images, archives, fonts), indicating them as `[Binary File: ... - Content not included]`.
*   **Clipboard Integration:** Copies the generated context directly to your clipboard with a single click.
*   **Cross-Platform:** Built with Wails, aiming for compatibility with macOS, Windows, and Linux. (See Prerequisites for specific supported versions).

## 📸 Screenshot

```
[------------------------------------]
| [Select Project]  Sift Context Builder  |
|------------------------------------|
| [▾][✓] my-project                  | <- Root node with toggle & select-all
|  |   ├── [✓] src/                  |
|  |   │   ├── [✓] main.go           |
|  |   │   └── [✓] utils.go          |
|  |   ├── [_] node_modules/         | <- Ignored/Filtered out
|  |   ├── [ ] README.md             |
|  |   └── [ ] .gitignore            | <- Ignored/Filtered out
|------------------------------------|
| [ Generate & Copy Context (4 items) ] |
|   Context copied to clipboard!     |
[------------------------------------]
```

## 🚀 Usage

1.  **Launch Sift.**
2.  Click the "**Select Project**" button.
3.  Navigate to and select the root directory of the project you want to analyze.
4.  The file tree will load, automatically applying filters based on `.gitignore`, dotfiles, etc.
5.  Use the checkboxes to **select the specific files and folders** you want to include in the LLM context.
    *   Use the root checkbox next to the project name to quickly select or deselect all visible items.
    *   Use the `▾`/`▸` toggle next to the root checkbox to expand or collapse the entire tree view.
6.  Once you've made your selection, click the "**Generate & Copy Context (N items)**" button at the bottom.
7.  The formatted context string (including the file map and selected file contents) will be copied to your clipboard.
8.  Paste the context into your preferred LLM prompt.

## 🛠️ Prerequisites (for Development & Building)

Before you can develop or build Sift, you need to install the necessary dependencies for Wails.

**Supported Platforms:**

*   Windows 10/11 (AMD64/ARM64)
*   macOS 10.13+ (AMD64) / 11.0+ (ARM64)
*   Linux (AMD64/ARM64)

**Core Dependencies:**

1.  **Go:** Version **1.20 or newer**.
    *   Download and install from the [official Go website](https://go.dev/dl/).
    *   Follow the [official installation instructions](https://go.dev/doc/install).
    *   **Crucially, ensure the `go/bin` directory (usually `~/go/bin` on Linux/macOS or `%USERPROFILE%\go\bin` on Windows) is added to your system's `PATH` environment variable.**
    *   Verify installation:
        ```bash
        go version
        echo $PATH # (or echo %PATH% on Windows) - Check if go/bin is listed
        ```

2.  **Node.js (includes npm):** Version **15 or newer**. Wails uses npm for some operations.
    *   Download and install from the [official Node.js website](https://nodejs.org/). LTS version is recommended.
    *   Verify installation:
        ```bash
        node -v
        npm -v
        ```

3.  **pnpm:** This project uses `pnpm` to manage frontend dependencies.
    *   Install pnpm (after installing Node.js):
        ```bash
        npm install -g pnpm
        ```
    *   Verify installation:
        ```bash
        pnpm -v
        ```

**Platform-Specific Dependencies:**

Wails requires certain system libraries.

*   **Windows:** Requires the [WebView2 runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section). It might already be installed on newer Windows versions.
*   **macOS:** Requires Xcode Command Line Tools. Install via: `xcode-select --install`
*   **Linux:** Requires standard build tools (`gcc`) and libraries like WebKit (`libgtk-3-dev`, `libwebkit2gtk-4.0-dev`). Requirements vary slightly by distribution. Please refer to the [official Wails documentation (Linux Prerequisites)](https://wails.io/docs/gettingstarted/installation#linux) for specific package names for your distribution (Debian/Ubuntu, Arch, Fedora, etc.).

**Install Wails CLI:**

Once Go is set up correctly, install the Wails CLI tool:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

*   **Troubleshooting:** If you get an error like `pattern all:ides/*: no matching files found`, ensure you are using Go 1.18 or newer (`go version`).

**System Check:**

After installing all prerequisites, run the Wails diagnostic tool. It helps identify any missing dependencies or configuration issues:

```bash
wails doctor
```
*   Address any errors reported by `wails doctor` before proceeding.

**PATH Troubleshooting:**

*   If your terminal reports `wails: command not found` after installation, double-check that your `go/bin` directory is correctly added to your `PATH`. You might need to restart your terminal or even your system for PATH changes to take effect.

## 💻 Development

To run Sift in live development mode after setting up all prerequisites:

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    cd sift-context-builder # Or your project directory name
    ```
2.  Navigate to the `frontend` directory and install dependencies using `pnpm`:
    ```bash
    cd frontend
    pnpm install
    cd ..
    ```
3.  Run the Wails development server from the project root:
    ```bash
    wails dev
    ```
    *   This starts the application with hot-reloading for frontend changes (React/TypeScript/CSS).
    *   Changes to the Go backend code require restarting the `wails dev` command.

## 📦 Building

To build a redistributable, production-ready package for your platform:

1.  Ensure all prerequisites are installed and `wails doctor` reports no issues.
2.  Make sure frontend dependencies are installed (`cd frontend && pnpm install` if you haven't already).
3.  Run the build command from the project root:
    ```bash
    wails build
    ```
4.  The compiled executable(s) will be located in the `build/bin` directory.

**Optional Build Tools:**

*   **UPX:** Can be used to compress the final executable. Install it separately if desired.
*   **NSIS:** Required for generating Windows installers (`.exe`). Install it separately if needed. Wails will automatically use them if detected during the build.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

*   **kuohao**
*   <jzy896370029@gmail.com>

</details>

---

<details>
<summary>🇨🇳 中文说明 / Chinese Version</summary>

## ✨ 功能特性

*   **目录选择:** 轻松浏览并选择您的项目根目录。
*   **过滤文件树:** 显示清晰的项目文件树视图，并自动隐藏：
    *   项目中 `.gitignore` 文件内指定的忽略文件和文件夹。
    *   点文件和点目录 (例如 `.git`, `.DS_Store`, `.vscode`, `.idea`)。
    *   常见的依赖目录 (例如 `node_modules`, `dist`, `build`, `target`)。
*   **选择性包含:** 使用复选框选择您想要包含在上下文中的特定文件或整个目录。
    *   选中/取消选中目录会递归地应用于其子项。
    *   如果子项被选中，其父目录也会自动被选中。
    *   "半选"状态的复选框表示目录中有部分子项被选中。
    *   根节点复选框允许一键选中/取消选中所有*可见*的文件和文件夹。
*   **上下文生成:** 创建一个格式化的输出字符串，包含：
    *   一个 `<file_map>` 部分，可视化项目根目录下*所有可见*（未被忽略）文件和文件夹的结构（遵循 `.gitignore` 规则）。
    *   一个 `<file_contents>` 部分，仅包含*被选中*文件的内容。
    *   自动检测文件语言，为 Markdown 代码块提供语法高亮提示 (例如 ```go)。
    *   自动排除检测到的二进制文件（如图片、压缩包、字体）的内容，并标记为 `[Binary File: ... - Content not included]`。
*   **剪贴板集成:** 只需单击一下，即可将生成的上下文直接复制到您的剪贴板。
*   **跨平台:** 使用 Wails 构建，旨在兼容 macOS、Windows 和 Linux。（请参阅“先决条件”了解具体支持的版本）。

## 📸 截图

```
[------------------------------------]
| [选择项目]    Sift Context Builder    |
|------------------------------------|
| [▾][✓] my-project                  | <- 可切换展开/折叠及全选的根节点
|  |   ├── [✓] src/                  |
|  |   │   ├── [✓] main.go           |
|  |   │   └── [✓] utils.go          |
|  |   ├── [_] node_modules/         | <- 已忽略/被过滤
|  |   ├── [ ] README.md             |
|  |   └── [ ] .gitignore            | <- 已忽略/被过滤
|------------------------------------|
| [ 生成并复制代码 (4 项) ]          |
|   上下文已复制到剪贴板！           |
[------------------------------------]
```

## 🚀 如何使用

1.  **启动 Sift 应用程序。**
2.  点击 "**选择项目**" 按钮。
3.  浏览并选择您想要分析的项目的根目录。
4.  程序将加载文件树，并自动根据 `.gitignore` 和点文件规则进行过滤。
5.  使用复选框**选择您希望包含在 LLM 上下文中的文件和文件夹**。
    *   使用项目名称旁边的根复选框可以快速选择或取消选择所有可见项。
    *   使用根复选框旁边的 `▾`/`▸` 图标可以展开或折叠整个文件树。
6.  完成选择后，点击底部的 "**生成并复制代码 (N 项)**" 按钮。
7.  格式化好的上下文文本（包含文件地图和所选文件内容）将被复制到您的剪贴板。
8.  将上下文粘贴到您喜欢的大语言模型（LLM）的提示中。

## 🛠️ 先决条件 (用于开发和构建)

在开始开发或构建 Sift 之前，您需要安装 Wails 所必需的依赖项。

**支持的平台:**

*   Windows 10/11 (AMD64/ARM64)
*   macOS 10.13+ (AMD64) / 11.0+ (ARM64)
*   Linux (AMD64/ARM64)

**核心依赖项:**

1.  **Go:** 版本 **1.20 或更高**。
    *   从 [Go 官方网站](https://go.dev/dl/) 下载并安装。
    *   遵循 [官方安装说明](https://go.dev/doc/install)。
    *   **关键：确保 `go/bin` 目录 (Linux/macOS 通常是 `~/go/bin`，Windows 通常是 `%USERPROFILE%\go\bin`) 已添加到您系统的 `PATH` 环境变量中。**
    *   验证安装：
        ```bash
        go version
        echo $PATH # (Windows 上使用 echo %PATH%) - 检查 go/bin 是否在列表中
        ```

2.  **Node.js (包含 npm):** 版本 **15 或更高**。 Wails 会使用 npm 执行一些操作。
    *   从 [Node.js 官方网站](https://nodejs.org/) 下载并安装。推荐使用 LTS 版本。
    *   验证安装：
        ```bash
        node -v
        npm -v
        ```

3.  **pnpm:** 本项目使用 `pnpm` 管理前端依赖。
    *   安装 pnpm (在安装 Node.js 之后)：
        ```bash
        npm install -g pnpm
        ```
    *   验证安装：
        ```bash
        pnpm -v
        ```

**特定平台依赖项:**

Wails 需要一些系统库。

*   **Windows:** 需要 [WebView2 运行时](https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/#download-section)。较新的 Windows 版本可能已经预装了。
*   **macOS:** 需要 Xcode 命令行工具。通过命令安装：`xcode-select --install`
*   **Linux:** 需要标准的构建工具 (`gcc`) 和 WebKit 等库 (`libgtk-3-dev`, `libwebkit2gtk-4.0-dev`)。具体需求因发行版而异。请参考 [Wails 官方文档 (Linux 先决条件)](https://wails.io/zh-Hans/docs/gettingstarted/installation#linux) 获取适用于您发行版 (Debian/Ubuntu, Arch, Fedora 等) 的具体包名。

**安装 Wails CLI:**

正确设置 Go 之后，安装 Wails CLI 工具：

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

*   **问题排查:** 如果您遇到类似 `pattern all:ides/*: no matching files found` 的错误，请确保您使用的是 Go 1.18 或更高版本 (`go version`)。

**系统检查:**

安装完所有先决条件后，运行 Wails 的诊断工具。它可以帮助识别任何缺失的依赖项或配置问题：

```bash
wails doctor
```
*   在继续之前，请解决 `wails doctor` 报告的所有错误。

**PATH 问题排查:**

*   如果在安装后，您的终端报告 `wails: command not found` (找不到 wails 命令)，请再次检查您的 `go/bin` 目录是否已正确添加到 `PATH` 中。您可能需要重启终端甚至系统才能使 `PATH` 的更改生效。

## 💻 开发

在完成所有先决条件设置后，要在实时开发模式下运行 Sift：

1.  克隆仓库：
    ```bash
    git clone <your-repo-url>
    cd sift-context-builder # 或你的项目目录名
    ```
2.  进入 `frontend` 目录并使用 `pnpm` 安装依赖：
    ```bash
    cd frontend
    pnpm install
    cd ..
    ```
3.  从项目根目录运行 Wails 开发服务器：
    ```bash
    wails dev
    ```
    *   这将启动应用程序，并为前端更改（React/TypeScript/CSS）启用热重载。
    *   更改 Go 后端代码需要重启 `wails dev` 命令。

## 📦 构建

要为您的平台构建可分发的、生产就绪的软件包：

1.  确保所有先决条件都已安装，并且 `wails doctor` 没有报告任何问题。
2.  确保前端依赖项已安装（如果尚未安装，请执行 `cd frontend && pnpm install`）。
3.  在项目根目录运行构建命令：
    ```bash
    wails build
    ```
4.  编译生成的可执行文件将位于 `build/bin` 目录中。

**可选的构建工具:**

*   **UPX:** 可用于压缩最终的可执行文件。如果需要，请单独安装。
*   **NSIS:** 用于生成 Windows 安装程序 (`.exe`)。如果需要，请单独安装。如果在构建时检测到它们，Wails 会自动使用。

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 👤 作者

*   **kuohao**
*   <jzy896370029@gmail.com>

</details>
