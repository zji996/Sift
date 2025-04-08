// File: /Users/zeyuji/Projects/AI_Toolkit/Sift/app.go
package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time" // For clipboard feedback delay

	gitignore "github.com/sabhiram/go-gitignore"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// FileNode represents a file or directory in the tree
type FileNode struct {
	Name     string     `json:"name"`
	Path     string     `json:"path"`
	IsDir    bool       `json:"isDir"`
	Children []FileNode `json:"children,omitempty"` // Omit if empty
}

// Helper function to load and parse .gitignore
func loadGitignore(rootDir string) (*gitignore.GitIgnore, error) {
	ignoreFilePath := filepath.Join(rootDir, ".gitignore")
	if _, err := os.Stat(ignoreFilePath); os.IsNotExist(err) {
		return nil, nil // No .gitignore file found is okay
	}
	// Important: Use CompileIgnoreFileAndLines if you want to add default ignores programmatically
	ignorer, err := gitignore.CompileIgnoreFile(ignoreFilePath)
	if err != nil {
		return nil, fmt.Errorf("error compiling .gitignore file %s: %w", ignoreFilePath, err)
	}
	return ignorer, nil
}

// ListDirectory recursively lists files and directories for a given path.
// Filters based on dotfiles and .gitignore found in the root directory.
func (a *App) ListDirectory(rootDir string) ([]FileNode, error) {
	ignorer, err := loadGitignore(rootDir)
	if err != nil {
		fmt.Printf("Warning: Could not load or compile .gitignore: %v\n", err)
		ignorer = nil // Proceed without gitignore matching if loading failed
	}
	return a.listDirectoryRecursive(rootDir, rootDir, ignorer)
}

// isHidden returns true if the file/directory should be hidden based on name conventions or gitignore.
// rootDir is the directory containing the .gitignore file.
// fullPath is the absolute path to the item being checked.
// ignorer is the compiled gitignore object.
func isHidden(rootDir, fullPath string, isDir bool, ignorer *gitignore.GitIgnore) bool {
	name := filepath.Base(fullPath)

	// --- Filter Rules ---
	// 1. Hide dot files/directories (like .git, .DS_Store, .vscode, .idea, and crucially .gitignore itself)
	if strings.HasPrefix(name, ".") {
		return true
	}
	// 2. Hide common build/dependency directories explicitly (can also be in .gitignore)
	//    Doing it here ensures they are hidden even without .gitignore
	if isDir && (name == "node_modules" || name == "vendor" || name == "dist" || name == "build" || name == "target") {
		// Add more common folders if needed
		// Be careful: This hides ANY directory named 'build', etc. Might be too broad.
		// Relying on .gitignore is usually better for project-specific build dirs.
		// Let's comment out the broad ones and rely on .gitignore primarily.
		// Keep node_modules as it's almost universally ignored.
		if name == "node_modules" {
			return true
		}
	}

	// 3. Check .gitignore (if loaded)
	if ignorer != nil {
		// Get path relative to the root where .gitignore resides
		relativePath, err := filepath.Rel(rootDir, fullPath)
		if err != nil {
			fmt.Printf("Warning: Could not get relative path for gitignore check: %s (%v)\n", fullPath, err)
			// Decide how to handle: treat as not ignored or ignored? Let's treat as not ignored.
			return false
		}
		// Use forward slashes for matching
		relativePath = filepath.ToSlash(relativePath)
		// The gitignore library needs the path and whether it's a directory
		matches, _ := ignorer.MatchesPathHow(relativePath)
		if matches {
			return true
		}
	}

	return false
}

// Recursive helper for ListDirectory
func (a *App) listDirectoryRecursive(rootDir, currentPath string, ignorer *gitignore.GitIgnore) ([]FileNode, error) {
	var nodes []FileNode

	entries, err := os.ReadDir(currentPath)
	if err != nil {
		fmt.Printf("Warning: Error reading directory %s: %v\n", currentPath, err)
		return nil, nil // Return empty slice for this level
	}

	sort.Slice(entries, func(i, j int) bool {
		if entries[i].IsDir() != entries[j].IsDir() {
			return entries[i].IsDir() // Dirs first
		}
		return entries[i].Name() < entries[j].Name() // Then alphabetical
	})

	for _, entry := range entries {
		fullPath := filepath.Join(currentPath, entry.Name())
		isDir := entry.IsDir()

		// --- Check if Hidden ---
		if isHidden(rootDir, fullPath, isDir, ignorer) {
			continue // Skip this entry entirely
		}

		node := FileNode{
			Name:  entry.Name(),
			Path:  fullPath,
			IsDir: isDir,
		}

		if isDir {
			children, _ := a.listDirectoryRecursive(rootDir, fullPath, ignorer)
			if len(children) > 0 {
				node.Children = children
			}
		}
		nodes = append(nodes, node)
	}
	return nodes, nil
}

// GenerateContextInput defines the input for GenerateContext
type GenerateContextInput struct {
	RootDir       string   `json:"rootDir"`
	SelectedPaths []string `json:"selectedPaths"`
}

// GenerateContext constructs the <file_map> and <file_contents> string.
func (a *App) GenerateContext(input GenerateContextInput) (string, error) {
	var fileMapBuilder strings.Builder
	var fileContentsBuilder strings.Builder
	var processingError error

	ignorer, err := loadGitignore(input.RootDir)
	if err != nil {
		fmt.Printf("Warning: Could not load .gitignore for context generation: %v\n", err)
		ignorer = nil
	}

	selectedPathsSet := make(map[string]bool)
	for _, p := range input.SelectedPaths {
		// Crucially, *verify* the selected path isn't actually hidden before adding it.
		// This prevents processing files that shouldn't have been selectable.
		info, statErr := os.Stat(p)
		if statErr != nil {
			fmt.Printf("Warning: Stat failed for selected path %s: %v\n", p, statErr)
			continue // Skip if we can't stat it
		}
		if !isHidden(input.RootDir, p, info.IsDir(), ignorer) {
			selectedPathsSet[p] = true
		} else {
			fmt.Printf("Info: Ignoring selected path that should be hidden: %s\n", p)
		}
	}

	// Rebuild the list of paths to process based on the filtered set
	validSelectedPaths := []string{}
	for path := range selectedPathsSet {
		validSelectedPaths = append(validSelectedPaths, path)
	}
	sort.Strings(validSelectedPaths) // Sort for consistent output

	// --- Build File Map ---
	fileMapBuilder.WriteString("<file_map>\n")
	mapBuildErr := buildFileMapRecursive(input.RootDir, input.RootDir, "", &fileMapBuilder, selectedPathsSet /* Pass set for potential future use? */, ignorer)
	if mapBuildErr != nil {
		if processingError == nil {
			processingError = fmt.Errorf("error building file map: %w", mapBuildErr)
		}
	}
	fileMapBuilder.WriteString("</file_map>\n\n")

	// --- Build File Contents ---
	fileContentsBuilder.WriteString("<file_contents>\n")
	processedFiles := make(map[string]bool)

	var addFileContent func(filePath string)
	addFileContent = func(filePath string) {
		if processedFiles[filePath] {
			return
		}

		info, err := os.Stat(filePath)
		if err != nil {
			// Don't add error messages for files that failed stat, maybe log it
			fmt.Printf("Error stating file for content %s: %v\n", filePath, err)
			processedFiles[filePath] = true // Mark as processed to avoid re-trying
			return
		}

		// Double-check if hidden RIGHT before processing content (defense in depth)
		if isHidden(input.RootDir, filePath, info.IsDir(), ignorer) {
			processedFiles[filePath] = true // Mark hidden files as processed too
			return
		}

		relativePath := getRelativePath(input.RootDir, filePath)

		if info.IsDir() {
			entries, err := os.ReadDir(filePath)
			if err != nil {
				fmt.Fprintf(&fileContentsBuilder, "File: %s/\n```\nError reading directory content: %v\n```\n\n", relativePath, err)
				if processingError == nil {
					processingError = err
				}
				// Don't mark dir as processed in map, only its potential contents
				return
			}
			for _, entry := range entries {
				childPath := filepath.Join(filePath, entry.Name())
				addFileContent(childPath) // Recurse (will be checked by isHidden again)
			}
		} else {
			// Process File Content
			content, err := os.ReadFile(filePath)
			if err != nil {
				fmt.Fprintf(&fileContentsBuilder, "File: %s\n```\nError reading file content: %v\n```\n\n", relativePath, err)
				if processingError == nil {
					processingError = err
				}
			} else {
				isText := true // Assume text unless known binary extension
				ext := strings.ToLower(filepath.Ext(filePath))
				// Expanded list of binary extensions
				binaryExts := []string{
					".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".webp", ".ico", ".icns", // Images
					".mp4", ".mkv", ".mov", ".avi", ".wmv", ".flv", ".webm", // Videos
					".mp3", ".wav", ".ogg", ".flac", ".aac", // Audio
					".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz", // Archives
					".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods", ".odp", // Documents
					".exe", ".dll", ".so", ".dylib", ".app", ".deb", ".rpm", // Executables/Libraries
					".bin", ".dat", ".dump", // Binary data
					".woff", ".woff2", ".ttf", ".otf", ".eot", // Fonts
					".wasm",                    // WebAssembly
					".obj", ".o", ".a", ".lib", // Object files / libraries
					".class", ".jar", // Java bytecode
					".pyc",                   // Python bytecode
					".swf",                   // Flash
					".db", ".sqlite", ".mdb", // Databases
					".iso", ".img", // Disk Images
				}
				for _, binExt := range binaryExts {
					if ext == binExt {
						isText = false
						break
					}
				}

				if isText {
					lang := detectLanguage(filePath)
					fmt.Fprintf(&fileContentsBuilder, "File: %s\n```%s\n%s\n```\n\n", relativePath, lang, string(content))
				} else {
					fmt.Fprintf(&fileContentsBuilder, "File: %s\n```\n[Binary File: %s - Content not included]\n```\n\n", relativePath, filepath.Base(filePath))
				}
			}
			processedFiles[filePath] = true // Mark file as processed
		}
	}

	// Iterate through the *validated* selected paths
	for _, path := range validSelectedPaths {
		addFileContent(path)
	}

	fileContentsBuilder.WriteString("</file_contents>\n")

	finalOutput := fileMapBuilder.String() + fileContentsBuilder.String()
	return finalOutput, processingError
}

// buildFileMapRecursive helper to build the file map string.
// Uses isHidden for filtering.
func buildFileMapRecursive(rootDir, currentPath, indent string, builder *strings.Builder, selectedPaths map[string]bool, ignorer *gitignore.GitIgnore) error {
	entries, err := os.ReadDir(currentPath)
	if err != nil {
		fmt.Printf("Warning: Skipping unreadable directory in file map: %s (%v)\n", currentPath, err)
		return nil
	}

	sort.Slice(entries, func(i, j int) bool {
		if entries[i].IsDir() != entries[j].IsDir() {
			return entries[i].IsDir()
		}
		return entries[i].Name() < entries[j].Name()
	})

	filteredEntries := []os.DirEntry{}
	for _, entry := range entries {
		fullPath := filepath.Join(currentPath, entry.Name())
		// Check if hidden *before* adding to the list for map generation
		if !isHidden(rootDir, fullPath, entry.IsDir(), ignorer) {
			filteredEntries = append(filteredEntries, entry)
		}
	}

	lastIndex := len(filteredEntries) - 1
	for i, entry := range filteredEntries {
		name := entry.Name()
		fullPath := filepath.Join(currentPath, name)
		prefix := "├── "
		if i == lastIndex {
			prefix = "└── "
		}

		fmt.Fprintf(builder, "%s%s%s\n", indent, prefix, name)

		if entry.IsDir() {
			childIndent := indent
			if i == lastIndex {
				childIndent += "    "
			} else {
				childIndent += "│   "
			}
			buildFileMapRecursive(rootDir, fullPath, childIndent, builder, selectedPaths, ignorer)
			// Ignore nested errors for map building, just log them maybe
		}
	}
	return nil
}

// --- Other functions (getRelativePath, detectLanguage, CopyToClipboard, Greet, SelectDirectory) remain the same ---
// ... (Keep the existing code for these functions)

// getRelativePath calculates the relative path from rootDir to fullPath.
func getRelativePath(rootDir, fullPath string) string {
	relPath, err := filepath.Rel(rootDir, fullPath)
	if err != nil {
		// Fallback to full path if Rel fails (shouldn't happen if fullPath is inside rootDir)
		return fullPath
	}
	// Use forward slashes for consistency, especially for the context block format
	return filepath.ToSlash(relPath)
}

// detectLanguage provides a basic language hint for markdown code blocks based on extension.
func detectLanguage(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	base := filepath.Base(filePath)

	// Handle files with no extension first
	if ext == "" {
		lowerBase := strings.ToLower(base)
		switch lowerBase {
		case "dockerfile":
			return "dockerfile"
		case "makefile":
			return "makefile"
		case "gemfile":
			return "ruby" // Gemfile is Ruby
		case "rakefile":
			return "ruby" // Rakefile is Ruby
		case "procfile":
			return "shell" // Procfile usually contains shell commands
			// Add other common no-extension filenames if needed
		}
	}

	// Handle potential double extensions like .d.ts
	if strings.HasSuffix(strings.ToLower(filePath), ".d.ts") {
		return "typescript" // Treat declaration files as typescript
	}

	switch ext {
	case ".go":
		return "go"
	case ".js", ".mjs", ".cjs": // Add module JS extensions
		return "javascript"
	case ".ts", ".tsx", ".mts", ".cts": // Add module TS extensions
		return "typescript"
	case ".jsx":
		return "jsx" // React JS extension
	case ".vue":
		return "vue" // Vue SFC
	case ".svelte":
		return "svelte" // Svelte component
	case ".py", ".pyw":
		return "python"
	case ".java":
		return "java"
	case ".c":
		return "c"
	case ".cpp", ".cxx", ".cc", ".hpp", ".hxx", ".h": // Added more C++ extensions
		return "cpp"
	case ".cs":
		return "csharp"
	case ".rb":
		return "ruby"
	case ".php":
		return "php"
	case ".swift":
		return "swift"
	case ".kt", ".kts":
		return "kotlin"
	case ".rs":
		return "rust"
	case ".html", ".htm":
		return "html"
	case ".css":
		return "css"
	case ".scss", ".sass":
		return "scss" // Treat sass as scss for highlighting
	case ".less":
		return "less" // Add Less
	case ".json":
		return "json"
	case ".yaml", ".yml":
		return "yaml"
	case ".md", ".markdown":
		return "markdown"
	case ".sh", ".bash", ".zsh": // Added zsh
		return "bash" // Use bash for common shells
	case ".ps1":
		return "powershell"
	case ".sql":
		return "sql"
	case ".xml":
		return "xml"
	case ".toml":
		return "toml"
	case ".lua":
		return "lua" // Add Lua
	case ".pl", ".pm": // Add Perl
		return "perl"
	case ".r":
		return "r" // Add R
	case ".dart":
		return "dart" // Add Dart
	case ".ex", ".exs": // Add Elixir
		return "elixir"
	case ".erl", ".hrl": // Add Erlang
		return "erlang"
	case ".hs":
		return "haskell" // Add Haskell
	case ".scala":
		return "scala" // Add Scala
	case ".clj", ".cljs", ".cljc", ".edn": // Add Clojure
		return "clojure"
	case ".dockerfile", "dockerfile":
		// Base name check handles case with no extension above
		return "dockerfile"
	case ".mod":
		if base == "go.mod" {
			return "go.mod"
		}
		return "" // Generic .mod?
	case ".sum":
		if base == "go.sum" {
			return "go.sum"
		}
		return ""
	case ".tf", ".tfvars": // Add Terraform
		return "terraform"
	case ".hcl": // Add HCL (used by Terraform, Packer, etc.)
		return "hcl"
	case ".gradle": // Add Gradle
		return "groovy" // Gradle files are often Groovy
	case ".env":
		return "env" // Or "dotenv"
	case ".conf", ".cfg", ".ini":
		return "ini"
	case ".log":
		return "log"
	case ".lock": // e.g., package-lock.json, yarn.lock, Gemfile.lock, composer.lock
		if base == "package-lock.json" {
			return "json"
		}
		if base == "yarn.lock" {
			return ""
		} // Yarn lock has unique format
		if base == "Gemfile.lock" {
			return "ruby"
		} // Gemfile.lock is somewhat Rubyish
		if base == "composer.lock" {
			return "json"
		}
		// Add more specific lock files if needed
		return "" // Generic lock file
	default:
		return "" // No language hint
	}
}

// CopyToClipboard copies the given text to the system clipboard.
func (a *App) CopyToClipboard(text string) error {
	err := runtime.ClipboardSetText(a.ctx, text)
	if err != nil {
		return fmt.Errorf("failed to copy to clipboard: %w", err)
	}
	// Optionally add a small delay and maybe emit an event back if needed
	// For now, the frontend will handle feedback immediately.
	time.Sleep(100 * time.Millisecond) // Small delay just in case
	return nil
}

// --- Keep Greet or remove ---
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// --- Keep SelectDirectory ---
func (a *App) SelectDirectory() (string, error) {
	selectedDirectory, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Project Directory",
	})
	if err != nil {
		return "", err
	}
	// Wails V2 runtime returns empty string on cancel, not an error sometimes.
	// Frontend should handle the empty string case if needed.
	return selectedDirectory, nil
}
