import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './style.css';
import { BrowserOpenDirectoryDialog, ListDirectoryContents, GetMultipleFileContents } from '../wailsjs/go/main/App.js';
import { DirectoryEntry, FileContentResponse as FrontendFileContentResponse } from './types/index.js';
import { ToastManager } from './components/Toast.js';
import { FilterPanel } from './components/FilterPanel.js';
import ParticleBackground from './components/ParticleBackground.js';
import { EmptyState } from './components/EmptyState.js';
import { FileSizePanel } from './components/FileSizePanel.js';
import Header from './components/Header.js';
import FileTreePanel from './components/FileTreePanel.js';
import OutputPanel from './components/OutputPanel.js';
import { useToast } from './hooks/useToast.js';



function App() {
    const [rootDir, setRootDir] = useState<string | null>(null);
    const [tree, setTree] = useState<DirectoryEntry[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileMapOutput, setFileMapOutput] = useState('');
    const [fileContentsOutput, setFileContentsOutput] = useState('');
    const [filesBySize, setFilesBySize] = useState<DirectoryEntry[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [gridCols, setGridCols] = useState<'grid-cols-3' | 'grid-cols-4'>('grid-cols-3');
    
    const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

    // 主题切换
    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }, [isDarkMode]);

    // 优化的网格列数切换逻辑
    const toggleFilterPanel = useCallback(() => {
        if (showFilterPanel) {
            // 隐藏面板时，先触发退出动画，布局变化在 onExitComplete 中处理
            setShowFilterPanel(false);
        } else {
            // 显示面板时，先切换布局，稍微延迟后再显示面板
            setGridCols('grid-cols-4');
            // 给布局变化一点时间完成
            setTimeout(() => {
                setShowFilterPanel(true);
            }, 50);
        }
    }, [showFilterPanel]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        showInfo(isDarkMode ? '🌞 已切换到浅色模式' : '🌙 已切换到深色模式');
    };

    // 辅助函数：递归查找目录树中的条目
    const findEntryFlat = (entries: DirectoryEntry[], targetPath: string): DirectoryEntry | null => {
        for (const entry of entries) {
            if (entry.path === targetPath) return entry;
            if (entry.isDir && entry.children) {
                const found = findEntryFlat(entry.children, targetPath);
                if (found) return found;
            }
        }
        return null;
    };

    // 计算所有路径的总数
    const totalPathsCount = useMemo(() => {
        const countAllPaths = (entries: DirectoryEntry[]): number => {
            let count = 0;
            entries.forEach(entry => {
                count++;
                if (entry.isDir && entry.children) {
                    count += countAllPaths(entry.children);
                }
            });
            return count;
        };
        return countAllPaths(tree);
    }, [tree]);

    // 判断是否全选
    const isAllSelected = useMemo(() => {
        return totalPathsCount > 0 && selectedPaths.size === totalPathsCount;
    }, [selectedPaths.size, totalPathsCount]);

    // Effect to update filesBySize when tree changes
    useEffect(() => {
        const flattenAndSortFiles = (entries: DirectoryEntry[]): DirectoryEntry[] => {
            let files: DirectoryEntry[] = [];
            entries.forEach(entry => {
                if (!entry.isDir) {
                    files.push(entry);
                } else if (entry.children) {
                    files = files.concat(flattenAndSortFiles(entry.children));
                }
            });
            return files.sort((a, b) => (b.size || 0) - (a.size || 0));
        };

        if (tree.length > 0) {
            setFilesBySize(flattenAndSortFiles(tree));
        } else {
            setFilesBySize([]);
        }
    }, [tree]);

    const handleSelectDirectory = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const selectedDir = await BrowserOpenDirectoryDialog("选择项目目录");
            if (selectedDir) {
                setRootDir(selectedDir);
                const fetchedTree = await ListDirectoryContents(selectedDir, "");
                setTree(fetchedTree || []);
                setSelectedPaths(new Set());
                setFileMapOutput('');
                setFileContentsOutput('');
                showSuccess(`✨ 已载入项目: ${selectedDir.split(/[\/\\]/).pop()}`);
            }
        } catch (err: any) {
            const errorMsg = err.message || "打开目录失败";
            setError(errorMsg);
            showError(errorMsg);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectPath = useCallback((path: string, isDir: boolean, children?: DirectoryEntry[]) => {
        setSelectedPaths(prev => {
            const newSelected = new Set(prev);
            const updateChildren = (entries: DirectoryEntry[], select: boolean) => {
                entries.forEach(entry => {
                    if (select) newSelected.add(entry.path);
                    else newSelected.delete(entry.path);
                    if (entry.isDir && entry.children) {
                        updateChildren(entry.children, select);
                    }
                });
            };

            if (newSelected.has(path)) {
                newSelected.delete(path);
                if (isDir && children) updateChildren(children, false);
            } else {
                newSelected.add(path);
                if (isDir && children) updateChildren(children, true);
            }
            return newSelected;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (isAllSelected) {
            setSelectedPaths(new Set());
            showInfo("已取消全选");
        } else {
            const newSelected = new Set<string>();
            const addAllPaths = (entries: DirectoryEntry[]) => {
                entries.forEach(entry => {
                    newSelected.add(entry.path);
                    if (entry.isDir && entry.children) {
                        addAllPaths(entry.children);
                    }
                });
            };
            addAllPaths(tree);
            setSelectedPaths(newSelected);
            showInfo(`✅ 已选择 ${newSelected.size} 项`);
        }
    }, [isAllSelected, tree, showInfo]);

    const handleSelectByExtensions = useCallback((extensions: string[], add: boolean) => {
        setSelectedPaths(prev => {
            const newSelected = new Set(prev);
            const processPathsByExtension = (entries: DirectoryEntry[]) => {
                entries.forEach(entry => {
                    if (!entry.isDir) {
                        const ext = '.' + entry.name.split('.').pop()?.toLowerCase();
                        if (extensions.includes(ext)) {
                            if (add) {
                                newSelected.add(entry.path);
                            } else {
                                newSelected.delete(entry.path);
                            }
                        }
                    } else if (entry.children) {
                        processPathsByExtension(entry.children);
                    }
                });
            };
            processPathsByExtension(tree);
            return newSelected;
        });
        
        // 计算影响的文件数量
        let affectedCount = 0;
        const countAffectedFiles = (entries: DirectoryEntry[]) => {
            entries.forEach(entry => {
                if (!entry.isDir) {
                    const ext = '.' + entry.name.split('.').pop()?.toLowerCase();
                    if (extensions.includes(ext)) {
                        affectedCount++;
                    }
                } else if (entry.children) {
                    countAffectedFiles(entry.children);
                }
            });
        };
        countAffectedFiles(tree);
        
        if (affectedCount > 0) {
            const action = add ? '➕' : '➖';
            showSuccess(`${action} ${affectedCount} 个文件`);
        } else {
            showInfo(`未找到相关文件`);
        }
    }, [tree, showSuccess, showInfo]);

    const generatePathMap = (entries: DirectoryEntry[], indent = ''): string => {
        let mapString = '';
        entries.forEach((entry, index) => {
            const isLast = index === entries.length - 1;
            const prefix = indent + (isLast ? '└── ' : '├── ');
            mapString += `${prefix}${entry.name}${entry.isDir ? '/' : ''}\n`;
            if (entry.isDir && entry.children) {
                mapString += generatePathMap(entry.children, indent + (isLast ? '    ' : '│   '));
            }
        });
        return mapString;
    };

    const handleGenerateOutput = async () => {
        if (!rootDir) {
            const errorMsg = "请先选择一个目录。";
            setError(errorMsg);
            showError(errorMsg);
            return;
        }
        if (selectedPaths.size === 0) {
            const errorMsg = "请先选择一些文件/文件夹。";
            setError(errorMsg);
            showError(errorMsg);
            return;
        }
        setIsGenerating(true);
        setError(null);

        try {
            // Generate File Map Output
            let treeString = "PROJECT_ROOT\n";
            if (tree.length > 0) {
                const rootDirName = rootDir.split(/[\/\\]/).pop() || "PROJECT_ROOT";
                treeString = `${rootDirName}/\n`;
                treeString += generatePathMap(tree, '');
            }
            setFileMapOutput(`<file_map>\n${treeString}</file_map>`);

            // Collect files to fetch contents for (only non-directory and selected)
            const filesToFetch: string[] = [];
            selectedPaths.forEach(path => {
                const entry = findEntryFlat(tree, path);
                if (entry && !entry.isDir) {
                    filesToFetch.push(path);
                }
            });

            if (filesToFetch.length === 0) {
                setFileContentsOutput("<file_contents>\n没有选择文本文件或所有选择的项目都是目录。\n</file_contents>");
                showInfo("没有找到可读取的文本文件");
                setIsGenerating(false);
                return;
            }

            // Fetch file contents
            const contents: FrontendFileContentResponse[] = await GetMultipleFileContents(rootDir, filesToFetch);
            let contentString = "<file_contents>\n";
            let processedCount = 0;
            let skippedCount = 0;
            
            contents.forEach(item => {
                if (item.error) {
                    contentString += `File: ${item.path}\nError: ${item.error}\n\n`;
                } else if (item.isBinary) {
                    contentString += `File: ${item.path}\n${item.content}\n\n`;
                    skippedCount++;
                } else {
                    contentString += `File: ${item.path}\n\`\`\`\n${item.content}\n\`\`\`\n\n`;
                    processedCount++;
                }
            });
            contentString += "</file_contents>";
            setFileContentsOutput(contentString);
            
            showSuccess(`🎉 生成完成！处理了 ${processedCount} 个文件`);
        } catch (err: any) {
            const errorMsg = err.message || "获取文件内容失败";
            setError(errorMsg);
            showError(errorMsg);
            console.error(err);
            setFileContentsOutput("<file_contents>\n获取内容时出错。\n</file_contents>");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async (text: string, message: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showSuccess(`📋 ${message}已复制到剪贴板`);
        } catch (err) {
            console.error("复制失败: ", err);
            showError("复制失败，请手动复制");
        }
    };

    const handleCopyAll = () => {
        const combinedText = `${fileMapOutput}\n\n${fileContentsOutput}`;
        copyToClipboard(combinedText, "完整输出");
    };

    // 动画变体
    const containerVariants = {
        initial: { opacity: 0 },
        animate: { 
            opacity: 1,
            transition: { 
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        initial: { y: 20, opacity: 0, scale: 0.95 },
        animate: { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            transition: { 
                type: "spring",
                damping: 25,
                stiffness: 200
            }
        }
    };

    return (
        <motion.div 
            className="h-screen flex flex-col text-gray-100 font-sans overflow-hidden"
            style={{ 
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            }}
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* 粒子背景 */}
            <ParticleBackground />
            
            {/* Toast Manager */}
            <ToastManager toasts={toasts} onRemoveToast={removeToast} />
            
            {/* 顶部工具栏 */}
            <Header
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                onSelectDirectory={handleSelectDirectory}
                onGenerateOutput={handleGenerateOutput}
                onCopyAll={handleCopyAll}
                isLoading={isLoading}
                isGenerating={isGenerating}
                rootDir={rootDir}
                selectedPathsSize={selectedPaths.size}
                totalPathsCount={totalPathsCount}
                error={error}
                hasOutput={Boolean(fileMapOutput || fileContentsOutput)}
            />

            {/* 主内容区域 */}
            <motion.div 
                className={`flex-1 p-6 overflow-hidden`}
                layout
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                {!rootDir ? (
                    <EmptyState onSelectDirectory={handleSelectDirectory} />
                ) : (
                    <div className={`${gridCols} grid gap-6 h-full panel-transition`}>
                        {/* 智能过滤面板 - 修复动画卡顿 */}
                        <AnimatePresence 
                            initial={false} 
                            mode="wait"
                            onExitComplete={() => {
                                // 当 FilterPanel 的退出动画完成后，将布局切换回 3 列
                                setGridCols('grid-cols-3');
                            }}
                        >
                            {showFilterPanel && (
                                <motion.div 
                                    key="filter-panel"
                                    className="flex flex-col overflow-hidden"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ 
                                        width: "auto", 
                                        opacity: 1,
                                        transition: {
                                            width: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                                            opacity: { duration: 0.2, delay: 0.2 }
                                        }
                                    }}
                                    exit={{ 
                                        width: 0, 
                                        opacity: 0,
                                        transition: {
                                            width: { duration: 0.3, ease: [0.55, 0.06, 0.68, 0.19], delay: 0.1 },
                                            opacity: { duration: 0.15 }
                                        }
                                    }}
                                >
                                    <FilterPanel
                                        selectedFilters={selectedFilters}
                                        onFilterChange={(filterId, selected) => {
                                            setSelectedFilters(prev => {
                                                const newFilters = new Set(prev);
                                                if (selected) {
                                                    newFilters.add(filterId);
                                                } else {
                                                    newFilters.delete(filterId);
                                                }
                                                return newFilters;
                                            });
                                        }}
                                        onSelectByExtensions={handleSelectByExtensions}
                                        onClearFilters={() => {
                                            setSelectedPaths(new Set());
                                            setSelectedFilters(new Set());
                                            showInfo("🧹 已清除所有选择");
                                        }}
                                        onClose={toggleFilterPanel}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 左侧：文件树 */}
                        <FileTreePanel
                            tree={tree}
                            selectedPaths={selectedPaths}
                            onToggleSelect={toggleSelectPath}
                            onToggleFilterPanel={toggleFilterPanel}
                            onSelectAll={handleSelectAll}
                            showFilterPanel={showFilterPanel}
                            rootDir={rootDir}
                            isLoading={isLoading}
                            isAllSelected={isAllSelected}
                        />

                        {/* 中间：按大小排序的文件 */}
                        <FileSizePanel
                            filesBySize={filesBySize}
                            selectedPaths={selectedPaths}
                            onToggleSelect={toggleSelectPath}
                        />

                        {/* 右侧：输出区域 */}
                        <motion.div 
                            className="overflow-hidden"
                            variants={cardVariants}
                        >
                            <OutputPanel
                                fileMapOutput={fileMapOutput}
                                fileContentsOutput={fileContentsOutput}
                                onCopyFileMap={() => copyToClipboard(fileMapOutput, "文件映射")}
                                onCopyFileContents={() => copyToClipboard(fileContentsOutput, "文件内容")}
                            />
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default App;