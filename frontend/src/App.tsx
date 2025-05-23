import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './style.css';
import { BrowserOpenDirectoryDialog, ListDirectoryContents, GetMultipleFileContents } from '../wailsjs/go/main/App.js';
import { DirectoryEntry, FileContentResponse as FrontendFileContentResponse } from './types/index.js';
import DirectoryTreeNode from './components/DirectoryTreeNode.js';
import { ToastManager } from './components/Toast.js';
import { FilterPanel } from './components/FilterPanel.js';
import ParticleBackground from './components/ParticleBackground.js';
import { Logo } from './components/Logo.js';
import { EmptyState } from './components/EmptyState.js';
import { useToast } from './hooks/useToast.js';

// 辅助函数：格式化字节大小
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 加载组件
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "加载中..." }) => (
    <motion.div
        className="flex flex-col items-center justify-center py-8 space-y-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
    >
        <Logo size="md" showText={false} animated={true} />
        <div className="loading-spinner" />
        <motion.p 
            className="text-gray-400 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
        >
            {message}
        </motion.p>
    </motion.div>
);

// 主题切换按钮组件
const ThemeToggle: React.FC<{ isDark: boolean; onToggle: () => void }> = ({ isDark, onToggle }) => (
    <motion.button
        onClick={onToggle}
        className="theme-toggle relative flex items-center"
        title={isDark ? "切换到浅色模式" : "切换到深色模式"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        <motion.div
            className="absolute left-1 text-xs"
            animate={{ opacity: isDark ? 0 : 1 }}
            transition={{ duration: 0.2 }}
        >
            ☀️
        </motion.div>
        <motion.div
            className="absolute right-1 text-xs"
            animate={{ opacity: isDark ? 1 : 0 }}
            transition={{ duration: 0.2 }}
        >
            🌙
        </motion.div>
    </motion.button>
);

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

    const headerVariants = {
        initial: { y: -50, opacity: 0 },
        animate: { 
            y: 0, 
            opacity: 1,
            transition: { 
                type: "spring",
                damping: 25,
                stiffness: 200
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
            <motion.header 
                className="flex-shrink-0 p-6 glass-effect border-b border-white/10"
                variants={headerVariants}
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <Logo size="lg" showText={true} animated={true} />
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* 主题切换按钮 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
                        </motion.div>
                        
                        <motion.button
                            onClick={handleSelectDirectory}
                            disabled={isLoading}
                            className="btn-apple px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg disabled:opacity-50 font-medium"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLoading && !rootDir ? (
                                <div className="flex items-center space-x-2">
                                    <div className="loading-spinner w-4 h-4" />
                                    <span>加载中...</span>
                                </div>
                            ) : '选择项目目录'}
                        </motion.button>
                        <motion.button
                            onClick={handleGenerateOutput}
                            disabled={isGenerating || !rootDir || selectedPaths.size === 0}
                            className="btn-apple px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg disabled:opacity-50 font-medium"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isGenerating ? (
                                <div className="flex items-center space-x-2">
                                    <div className="loading-spinner w-4 h-4" />
                                    <span>生成中...</span>
                                </div>
                            ) : '生成输出'}
                        </motion.button>
                        <motion.button
                            onClick={handleCopyAll}
                            disabled={!fileMapOutput && !fileContentsOutput}
                            className="btn-apple px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg disabled:opacity-50 font-medium"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            复制全部
                        </motion.button>
                    </div>
                </div>
                
                {/* 状态栏 */}
                <motion.div 
                    className="mt-4 flex items-center justify-between text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center space-x-6 text-gray-400">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>
                                {rootDir ? `项目: ${rootDir.split(/[\/\\]/).pop()}` : "未选择目录"}
                            </span>
                        </div>
                        {totalPathsCount > 0 && (
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span>已选择: {selectedPaths.size} / {totalPathsCount} 项</span>
                            </div>
                        )}
                    </div>
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                className="text-red-400 max-w-md truncate bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.header>

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
                        <motion.div 
                            className="flex flex-col glass-effect-strong rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                            variants={cardVariants}
                            layout
                        >
                            <div className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <motion.div
                                            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                        >
                                            <span className="text-sm">🌳</span>
                                        </motion.div>
                                        <h2 className="text-lg font-semibold gradient-text">文件树</h2>
                                        <motion.button
                                            onClick={toggleFilterPanel}
                                            disabled={!rootDir}
                                            className={`btn-apple p-2 rounded-lg transition-all ${
                                                showFilterPanel 
                                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                                                    : 'glass-effect text-gray-300 hover:text-white'
                                            } disabled:opacity-50`}
                                            title="智能过滤"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            🔍
                                        </motion.button>
                                    </div>
                                    <motion.button
                                        onClick={handleSelectAll}
                                        disabled={!rootDir || isLoading || tree.length === 0}
                                        className="btn-apple px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg disabled:opacity-50 font-medium"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isAllSelected ? '取消全选' : '全选'}
                                    </motion.button>
                                </div>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {isLoading && rootDir && (
                                        <LoadingSpinner message="正在扫描文件..." />
                                    )}
                                    {tree.length > 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            {tree.map((node, index) => (
                                                <motion.div
                                                    key={node.path}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <DirectoryTreeNode
                                                        node={node}
                                                        selectedPaths={selectedPaths}
                                                        onToggleSelect={toggleSelectPath}
                                                        level={0}
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        !isLoading && rootDir && (
                                            <motion.div
                                                className="text-center py-8"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <div className="text-6xl mb-4">📂</div>
                                                <p className="text-gray-400">目录为空或无可读文件</p>
                                            </motion.div>
                                        )
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* 中间：按大小排序的文件 */}
                        <motion.div 
                            className="flex flex-col glass-effect-strong rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                            variants={cardVariants}
                        >
                            <div className="flex-shrink-0 p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-white/10">
                                <div className="flex items-center space-x-3">
                                    <motion.div
                                        className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center"
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                    >
                                        <span className="text-sm">📊</span>
                                    </motion.div>
                                    <h2 className="text-lg font-semibold gradient-text">文件大小排序</h2>
                                    <span className="text-xs text-gray-400 bg-gray-600/20 px-2 py-1 rounded-full">前50</span>
                                </div>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                <AnimatePresence>
                                    {filesBySize.length > 0 ? (
                                        <motion.div className="space-y-2">
                                            {filesBySize.slice(0, 50).map((file, index) => (
                                                <motion.div
                                                    key={file.path}
                                                    className={`card-hover flex justify-between items-center p-3 rounded-lg border transition-all cursor-pointer ${
                                                        selectedPaths.has(file.path) 
                                                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30' 
                                                            : 'border-white/10 hover:border-blue-400/30 hover:bg-white/5'
                                                    }`}
                                                    onClick={() => toggleSelectPath(file.path, file.isDir, file.children)}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    whileHover={{ scale: 1.02, x: 4 }}
                                                >
                                                    <span className="truncate text-gray-300 text-sm font-medium flex-1">
                                                        {file.name}
                                                    </span>
                                                    <motion.span 
                                                        className="file-size-badge text-xs text-blue-300 font-mono ml-3 px-2 py-1 rounded-full flex-shrink-0"
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        {formatBytes(file.size || 0)}
                                                    </motion.span>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            className="text-center py-8"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="text-6xl mb-4">📊</div>
                                            <p className="text-gray-400">无文件可显示</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* 右侧：输出区域 */}
                        <motion.div 
                            className="flex flex-col space-y-6 overflow-hidden"
                            variants={cardVariants}
                        >
                            {/* 文件映射输出 */}
                            <div className="flex flex-col glass-effect-strong rounded-2xl shadow-2xl flex-1 overflow-hidden border border-white/10">
                                <div className="flex-shrink-0 p-4 bg-gradient-to-r from-green-600/20 to-teal-600/20 border-b border-white/10">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center"
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                            >
                                                <span className="text-sm">🗺️</span>
                                            </motion.div>
                                            <h2 className="text-lg font-semibold gradient-text">文件映射</h2>
                                        </div>
                                        <motion.button
                                            onClick={() => copyToClipboard(fileMapOutput, "文件映射")}
                                            disabled={!fileMapOutput}
                                            className="btn-apple px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg disabled:opacity-50 font-medium"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            复制
                                        </motion.button>
                                    </div>
                                </div>
                                <textarea
                                    readOnly
                                    value={fileMapOutput}
                                    placeholder="<file_map> 将在这里显示..."
                                    className="flex-1 p-4 bg-transparent text-gray-200 border-0 resize-none font-mono text-xs focus:outline-none custom-scrollbar placeholder-gray-500"
                                />
                            </div>

                            {/* 文件内容输出 */}
                            <div className="flex flex-col glass-effect-strong rounded-2xl shadow-2xl flex-1 overflow-hidden border border-white/10">
                                <div className="flex-shrink-0 p-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-white/10">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center"
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                            >
                                                <span className="text-sm">📄</span>
                                            </motion.div>
                                            <h2 className="text-lg font-semibold gradient-text">文件内容</h2>
                                        </div>
                                        <motion.button
                                            onClick={() => copyToClipboard(fileContentsOutput, "文件内容")}
                                            disabled={!fileContentsOutput}
                                            className="btn-apple px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg disabled:opacity-50 font-medium"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            复制
                                        </motion.button>
                                    </div>
                                </div>
                                <textarea
                                    readOnly
                                    value={fileContentsOutput}
                                    placeholder="所选文本文件的 <file_contents> 将在这里显示..."
                                    className="flex-1 p-4 bg-transparent text-gray-200 border-0 resize-none font-mono text-xs focus:outline-none custom-scrollbar placeholder-gray-500"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default App;