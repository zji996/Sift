package main

// DirectoryEntry represents a file or directory in the tree
type DirectoryEntry struct {
	Name     string           `json:"name"`
	Path     string           `json:"path"` // Relative path from the project root
	IsDir    bool             `json:"isDir"`
	Size     int64            `json:"size,omitempty"` // 新增：文件大小，单位字节
	Children []DirectoryEntry `json:"children,omitempty"`
	// We might add IsIgnored bool `json:"isIgnored"` if we want to show ignored files differently
}

// FileContentRequest is used to request content for multiple files
type FileContentRequest struct {
	Paths []string `json:"paths"`
}

// FileContentResponse holds the content of a file or a binary marker
type FileContentResponse struct {
	Path     string `json:"path"`
	Content  string `json:"content"`
	IsBinary bool   `json:"isBinary"`
	Error    string `json:"error,omitempty"`
}
