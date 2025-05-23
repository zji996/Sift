package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// 定义对AI无用的文件扩展名列表
var uselessExtensions = map[string]bool{
	// 字体文件
	".woff": true, ".woff2": true, ".ttf": true, ".otf": true, ".eot": true,
	// 图片文件
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".bmp": true, ".webp": true, ".svg": true, ".ico": true, ".tiff": true, ".tif": true,
	// 音频文件
	".mp3": true, ".wav": true, ".flac": true, ".aac": true, ".ogg": true, ".m4a": true, ".wma": true,
	// 视频文件
	".mp4": true, ".avi": true, ".mkv": true, ".mov": true, ".wmv": true, ".flv": true, ".webm": true, ".m4v": true,
	// 压缩文件
	".zip": true, ".rar": true, ".7z": true, ".tar": true, ".gz": true, ".bz2": true, ".xz": true,
	// 可执行文件
	".exe": true, ".dll": true, ".so": true, ".dylib": true, ".app": true, ".deb": true, ".rpm": true, ".dmg": true, ".msi": true,
	// 文档文件（大多数情况下对代码分析无用）
	".pdf": true, ".doc": true, ".docx": true, ".xls": true, ".xlsx": true, ".ppt": true, ".pptx": true,
	// 数据库文件
	".db": true, ".sqlite": true, ".sqlite3": true, ".mdb": true,
	// 其他二进制文件
	".bin": true, ".dat": true, ".dump": true, ".img": true, ".iso": true,
	// 缓存和临时文件
	".cache": true, ".tmp": true, ".temp": true, ".log": true, ".pid": true,
}

// isUselessFile 检查文件是否对AI分析无用
func isUselessFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return uselessExtensions[ext]
}

// isBinary checks if the content is likely binary.
// This is a heuristic and might not be perfect.
func isBinary(content []byte) bool {
	// Use http.DetectContentType
	contentType := http.DetectContentType(content)
	// Common text types
	if strings.HasPrefix(contentType, "text/") ||
		strings.Contains(contentType, "javascript") ||
		strings.Contains(contentType, "json") ||
		strings.Contains(contentType, "xml") ||
		// Add other known text types if needed
		contentType == "application/octet-stream" && len(content) > 0 && !containsNonPrintable(content, 0.1) { // for unknown, check non-printable
		return false
	}

	// If it's detected as octet-stream, do a more thorough check for non-printable characters
	if contentType == "application/octet-stream" {
		return containsNonPrintable(content, 0.1) // If more than 10% non-printable, assume binary
	}

	// Heuristic: if it's not detected as text, assume binary for many common binary mimetypes
	// This part can be expanded.
	binaryMIMEPrefixes := []string{
		"image/", "audio/", "video/", "application/zip", "application/pdf", "application/msword",
		"application/vnd.openxmlformats-officedocument", "application/octet-stream",
		"application/x-font", "font/", // 字体文件
	}
	for _, prefix := range binaryMIMEPrefixes {
		if strings.HasPrefix(contentType, prefix) {
			return true
		}
	}

	return false // Default to not binary if unsure after checks
}

// containsNonPrintable checks for a significant portion of non-printable characters
func containsNonPrintable(data []byte, threshold float64) bool {
	if len(data) == 0 {
		return false // Empty is not binary by this check
	}
	nonPrintableCount := 0
	// Consider first 512 bytes or whole file if smaller
	checkLen := 512
	if len(data) < checkLen {
		checkLen = len(data)
	}

	for i := 0; i < checkLen; i++ {
		b := data[i]
		if (b < 32 && b != '\n' && b != '\r' && b != '\t') || b == 127 {
			nonPrintableCount++
		}
	}
	return float64(nonPrintableCount)/float64(checkLen) > threshold
}

// GetMultipleFileContents reads content for multiple files.
// rootPath is the absolute path to the project's root.
func (a *App) GetMultipleFileContents(rootPath string, relativePaths []string) ([]FileContentResponse, error) {
	var results []FileContentResponse

	for _, relPath := range relativePaths {
		fullPath := filepath.Join(rootPath, relPath)
		var response FileContentResponse
		response.Path = filepath.ToSlash(relPath) // Ensure forward slashes

		// 首先检查是否是无用文件
		if isUselessFile(relPath) {
			response.IsBinary = true
			response.Content = fmt.Sprintf("[Skipped File: %s - File type not useful for AI analysis]", filepath.Base(relPath))
			results = append(results, response)
			continue
		}

		content, err := os.ReadFile(fullPath)
		if err != nil {
			response.Error = fmt.Sprintf("Error reading %s: %v", relPath, err)
			response.IsBinary = false // Cant determine
			results = append(results, response)
			continue
		}

		// 检查文件大小，超过1MB的文件可能不适合AI分析
		const maxFileSize = 1024 * 1024 // 1MB
		if len(content) > maxFileSize {
			response.IsBinary = true
			response.Content = fmt.Sprintf("[Large File: %s - File too large (%s) for AI analysis]",
				filepath.Base(relPath), formatFileSize(int64(len(content))))
			results = append(results, response)
			continue
		}

		if isBinary(content) {
			response.IsBinary = true
			response.Content = fmt.Sprintf("[Binary File: %s - Content not included]", filepath.Base(relPath))
		} else {
			response.IsBinary = false
			response.Content = string(content)
		}
		results = append(results, response)
	}
	return results, nil
}

// formatFileSize 格式化文件大小显示
func formatFileSize(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}
