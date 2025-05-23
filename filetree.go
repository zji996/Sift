package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	gitignore "github.com/sabhiram/go-gitignore" // We'll need to add this dependency
)

// 定义对AI分析无用的目录和文件模式
var defaultIgnorePatterns = []string{
	".git",
	"node_modules",
	"vendor",
	".next",
	".nuxt",
	"dist",
	"build",
	".svelte-kit",
	".vitepress/cache",
	".vitepress/dist",
	".astro",
	"__pycache__",
	"*.pyc",
	"*.pyo",
	".pytest_cache",
	".coverage",
	"coverage",
	".nyc_output",
	"*.min.js",
	"*.min.css",
	".cache",
	".temp",
	".tmp",
	"*.log",
	"*.pid",
	"*.swp",
	"*.swo",
	"*~",
	".DS_Store",
	"Thumbs.db",
	"*.woff",
	"*.woff2",
	"*.ttf",
	"*.otf",
	"*.eot",
}

// shouldIgnoreByDefault 检查路径是否应该被默认忽略
func shouldIgnoreByDefault(name, relPath string) bool {
	// 检查文件名或目录名
	for _, pattern := range defaultIgnorePatterns {
		if strings.HasPrefix(pattern, "*.") {
			// 扩展名匹配
			ext := strings.TrimPrefix(pattern, "*")
			if strings.HasSuffix(strings.ToLower(name), ext) {
				return true
			}
		} else if name == pattern {
			// 精确匹配
			return true
		}
	}

	// 检查路径中是否包含被忽略的目录
	pathParts := strings.Split(filepath.ToSlash(relPath), "/")
	for _, part := range pathParts {
		for _, pattern := range defaultIgnorePatterns {
			if !strings.Contains(pattern, ".") && part == pattern {
				return true
			}
		}
	}

	return false
}

// ListDirectoryContents recursively lists directory contents, respecting .gitignore
// The rootPath is the absolute path to the project's root directory.
// The currentRelPath is the path relative to rootPath we are currently listing.
func (a *App) ListDirectoryContents(rootPath string, currentRelPath string) ([]DirectoryEntry, error) {
	// Load .gitignore from the rootPath
	// For simplicity, we're only loading .gitignore from the root.
	// A more complete solution would handle .gitignore files in subdirectories.
	ignoreMatcher, _ := gitignore.CompileIgnoreFile(filepath.Join(rootPath, ".gitignore"))

	currentAbsPath := filepath.Join(rootPath, currentRelPath)
	entries, err := os.ReadDir(currentAbsPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory %s: %w", currentAbsPath, err)
	}

	var dirEntries []DirectoryEntry
	for _, entry := range entries {
		name := entry.Name()
		relPath := filepath.Join(currentRelPath, name)
		absEntryPath := filepath.Join(rootPath, relPath) // Use for gitignore check

		// 首先检查默认忽略规则
		if shouldIgnoreByDefault(name, relPath) {
			continue
		}

		// Check against .gitignore
		// go-gitignore expects paths relative to the .gitignore file's location (rootPath)
		// or absolute paths. Using absolute here.
		if ignoreMatcher != nil && ignoreMatcher.MatchesPath(absEntryPath) {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			// Skip problematic files/dirs but log it
			fmt.Printf("Warning: could not get info for %s: %v\n", relPath, err)
			continue
		}

		de := DirectoryEntry{
			Name:  name,
			Path:  filepath.ToSlash(relPath), // Ensure forward slashes for consistency
			IsDir: entry.IsDir(),
			Size:  info.Size(), // Set file size here
		}

		if de.IsDir {
			// Recursively list children if it's a directory
			// Pass the full rootPath and the new relative path for children
			children, err := a.ListDirectoryContents(rootPath, relPath)
			if err != nil {
				// Log or handle error, maybe skip this dir
				fmt.Printf("Warning: could not list children for %s: %v\n", relPath, err)
			} else {
				de.Children = children
			}
		}
		dirEntries = append(dirEntries, de)
	}

	// Sort entries: directories first, then by name
	sort.Slice(dirEntries, func(i, j int) bool {
		if dirEntries[i].IsDir != dirEntries[j].IsDir {
			return dirEntries[i].IsDir // True if i is dir and j is not (dirs first)
		}
		return dirEntries[i].Name < dirEntries[j].Name
	})

	return dirEntries, nil
}
