package main

import (
	"context"
	// "fmt" // No longer needed here if logging in sub-functions
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

// BrowserOpenDirectoryDialog 调用 Wails 运行时打开目录选择对话框
func (a *App) BrowserOpenDirectoryDialog(title string) (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: title,
	})
}
