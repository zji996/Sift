package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time" // For clipboard feedback delay

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

// ListDirectory recursively lists files and directories for a given path.
// It returns a slice of FileNode representing the tree structure.
// Basic filtering (e.g., ignores .git) is included.
func (a *App) ListDirectory(dirPath string) ([]FileNode, error) {
	var nodes []FileNode

	// Basic validation
	info, err := os.Stat(dirPath)
	if err != nil {
		return nil, fmt.Errorf("error accessing path %s: %w", dirPath, err)
	}
	if !info.IsDir() {
		return nil, fmt.Errorf("%s is not a directory", dirPath)
	}

	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, fmt.Errorf("error reading directory %s: %w", dirPath, err)
	}

	// Sort entries for consistent order
	sort.Slice(entries, func(i, j int) bool {
		// Directories first, then files, then alphabetically
		if entries[i].IsDir() != entries[j].IsDir() {
			return entries[i].IsDir() // true means directory, comes first
		}
		return entries[i].Name() < entries[j].Name()
	})

	for _, entry := range entries {
		name := entry.Name()
		fullPath := filepath.Join(dirPath, name)

		// --- Basic Filtering ---
		if name == ".git" || name == ".DS_Store" || name == "node_modules" || strings.HasPrefix(name, ".") { // Add more ignores as needed
			continue
		}
		// TODO: Add .gitignore parsing logic here for more robust filtering

		node := FileNode{
			Name:  name,
			Path:  fullPath,
			IsDir: entry.IsDir(),
		}

		if entry.IsDir() {
			// Recursively list children, ignore errors for subdirectories for now
			// A more robust solution might collect errors.
			children, _ := a.ListDirectory(fullPath)
			node.Children = children
		}

		nodes = append(nodes, node)
	}

	return nodes, nil
}

// GenerateContextInput defines the input for GenerateContext
type GenerateContextInput struct {
	RootDir       string   `json:"rootDir"`
	SelectedPaths []string `json:"selectedPaths"` // List of full paths selected by the user
}

// GenerateContext constructs the <file_map> and <file_contents> string.
func (a *App) GenerateContext(input GenerateContextInput) (string, error) {
	var fileMapBuilder strings.Builder
	var fileContentsBuilder strings.Builder
	var processingError error

	selectedPathsSet := make(map[string]bool)
	for _, p := range input.SelectedPaths {
		selectedPathsSet[p] = true
	}

	// --- Build File Map ---
	fileMapBuilder.WriteString("<file_map>\n")
	err := buildFileMapRecursive(input.RootDir, input.RootDir, "", &fileMapBuilder, selectedPathsSet)
	if err != nil {
		// Log or store the first error encountered during map building
		if processingError == nil {
			processingError = fmt.Errorf("error building file map: %w", err)
		}
	}
	fileMapBuilder.WriteString("</file_map>\n\n")

	// --- Build File Contents ---
	fileContentsBuilder.WriteString("<file_contents>\n")
	// Sort selected paths for consistent output
	sort.Strings(input.SelectedPaths)

	for _, path := range input.SelectedPaths {
		info, err := os.Stat(path)
		if err != nil {
			fmt.Fprintf(&fileContentsBuilder, "File: %s\n```\nError reading file info: %v\n```\n\n", getRelativePath(input.RootDir, path), err)
			if processingError == nil {
				processingError = fmt.Errorf("error getting file info for %s: %w", path, err)
			}
			continue
		}

		// Only include content for *files* that were explicitly selected or are descendants of selected folders
		// We rely on the frontend sending the correct list of files whose *content* is desired.
		// The current `selectedPathsSet` includes folders, so we need to check if it's a file.
		if !info.IsDir() {
			// Heuristic: Check if the file itself or any of its parent directories up to rootDir were selected
			includeContent := false
			tempPath := path
			for {
				if selectedPathsSet[tempPath] {
					includeContent = true
					break
				}
				parent := filepath.Dir(tempPath)
				if parent == tempPath || parent == "." || parent == input.RootDir || parent == filepath.Dir(input.RootDir) { // Stop condition
					break
				}
				tempPath = parent
			}

			if includeContent {
				relativePath := getRelativePath(input.RootDir, path)
				content, err := os.ReadFile(path)
				if err != nil {
					fmt.Fprintf(&fileContentsBuilder, "File: %s\n```\nError reading file content: %v\n```\n\n", relativePath, err)
					if processingError == nil {
						processingError = fmt.Errorf("error reading file content for %s: %w", path, err)
					}
				} else {
					// Basic check for text file (very naive) - improve this if needed
					// A better way involves checking MIME types or using libraries.
					isText := true // Assume text unless proven otherwise by common binary extensions
					ext := strings.ToLower(filepath.Ext(path))
					binaryExts := []string{".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4", ".mov", ".zip", ".gz", ".tar", ".pdf", ".exe", ".dll", ".bin", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".wasm"}
					for _, binExt := range binaryExts {
						if ext == binExt {
							isText = false
							break
						}
					}

					if isText {
						lang := detectLanguage(path) // Basic language detection by extension
						fmt.Fprintf(&fileContentsBuilder, "File: %s\n```%s\n%s\n```\n\n", relativePath, lang, string(content))
					} else {
						// For binary files selected, just indicate they are binary for now
						fmt.Fprintf(&fileContentsBuilder, "File: %s\n```\n[Binary File - Content not included]\n```\n\n", relativePath)
						// TODO: Add hook here for future multimodal summary call
					}
				}
			}
		}
	}
	fileContentsBuilder.WriteString("</file_contents>\n")

	// --- Combine ---
	// TODO: Add <multimodal_summaries> section here when implemented
	finalOutput := fileMapBuilder.String() + fileContentsBuilder.String()

	return finalOutput, processingError // Return generated string and any *first* error encountered
}

// buildFileMapRecursive is a helper to build the file map string.
func buildFileMapRecursive(rootDir, currentPath, indent string, builder *strings.Builder, selectedPaths map[string]bool) error {
	entries, err := os.ReadDir(currentPath)
	if err != nil {
		return fmt.Errorf("error reading directory %s: %w", currentPath, err)
	}

	// Sort entries like in ListDirectory
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].IsDir() != entries[j].IsDir() {
			return entries[i].IsDir()
		}
		return entries[i].Name() < entries[j].Name()
	})

	lastIndex := len(entries) - 1
	for i, entry := range entries {
		name := entry.Name()
		fullPath := filepath.Join(currentPath, name)

		// Skip filtered items same as ListDirectory
		if name == ".git" || name == ".DS_Store" || name == "node_modules" || strings.HasPrefix(name, ".") {
			continue
		}

		// Determine prefix (├── or └──)
		prefix := "├── "
		if i == lastIndex {
			prefix = "└── "
		}

		// Check if this item or its parent is selected (for highlighting/inclusion logic)
		// Note: This map string doesn't directly show selection, but useful for logic
		// isSelected := selectedPaths[fullPath]

		// Write the line to the builder
		fmt.Fprintf(builder, "%s%s%s\n", indent, prefix, name)

		if entry.IsDir() {
			// Determine the indent for children
			childIndent := indent
			if i == lastIndex {
				childIndent += "    " // No vertical line needed
			} else {
				childIndent += "│   " // Vertical line needed
			}
			// Recurse into subdirectory
			err := buildFileMapRecursive(rootDir, fullPath, childIndent, builder, selectedPaths)
			if err != nil {
				// Log or handle nested errors if needed, but continue building the map
				fmt.Printf("Warning: Error processing subdirectory %s: %v\n", fullPath, err)
			}
		}
	}
	return nil
}

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
	switch ext {
	case ".go":
		return "go"
	case ".js":
		return "javascript"
	case ".ts", ".tsx":
		return "typescript"
	case ".jsx":
		return "jsx"
	case ".py":
		return "python"
	case ".java":
		return "java"
	case ".c":
		return "c"
	case ".cpp", ".cxx", ".h", ".hpp":
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
		return "scss"
	case ".json":
		return "json"
	case ".yaml", ".yml":
		return "yaml"
	case ".md", ".markdown":
		return "markdown"
	case ".sh", ".bash":
		return "bash"
	case ".ps1":
		return "powershell"
	case ".sql":
		return "sql"
	case ".xml":
		return "xml"
	case ".toml":
		return "toml"
	case ".dockerfile", "dockerfile": // Handle Dockerfile with no extension too
		if strings.ToLower(filepath.Base(filePath)) == "dockerfile" {
			return "dockerfile"
		}
		return "dockerfile"
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
