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
*   **Cross-Platform:** Built with Wails, aiming for compatibility with macOS, Windows, and Linux.

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

## 💻 Development

To run Sift in live development mode:

1.  Make sure you have Go, Node.js, and pnpm installed.
2.  Use Wails CLI with npx: `npx wails@latest`
3.  Clone the repository.
4.  Navigate to the `frontend` directory and install dependencies:
    ```bash
    cd frontend
    pnpm install
    cd ..
    ```
5.  Run the development server:
    ```bash
    wails dev
    ```
    This will open the application with hot-reloading enabled for frontend changes (React/TS/CSS). Changes to Go code require restarting `wails dev`.

## 📦 Building

To build a redistributable, production-ready package for your platform:

1.  Ensure development dependencies are installed (`pnpm install` in `frontend`).
2.  Run the build command from the project root:
    ```bash
    wails build
    ```
3.  The executable will be located in the `build/bin` directory.

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
*   **跨平台:** 使用 Wails 构建，旨在兼容 macOS、Windows 和 Linux。

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

## 💻 开发

要在实时开发模式下运行 Sift：

1.  确保您已安装 Go、Node.js 和 pnpm。
2.  使用 npx 运行 Wails CLI：`npx wails@latest`
3.  克隆本仓库。
4.  进入 `frontend` 目录并安装依赖：
    ```bash
    cd frontend
    pnpm install
    cd ..
    ```
5.  运行开发服务器：
    ```bash
    wails dev
    ```
    这将启动应用程序，并为前端更改（React/TS/CSS）启用热重载。更改 Go 后端代码需要重启 `wails dev`。

## 📦 构建

要为您的平台构建可分发的、生产就绪的软件包：

1.  确保已安装开发依赖项（在 `frontend` 目录中运行 `pnpm install`）。
2.  在项目根目录运行构建命令：
    ```bash
    wails build
    ```
3.  生成的可执行文件将位于 `build/bin` 目录中。

## 📄 许可证

本项目采用MIT许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 👤 作者

*   **kuohao**
*   <jzy896370029@gmail.com>

</details>