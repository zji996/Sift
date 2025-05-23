import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.js';

interface FilterPreset {
    id: string;
    name: string;
    description: string;
    extensions: string[];
    icon: string;
}

const filterPresets: FilterPreset[] = [
    {
        id: 'frontend',
        name: '前端代码',
        description: 'HTML, CSS, JS, TS, React等',
        extensions: ['.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.scss', '.sass', '.less'],
        icon: '🎨'
    },
    {
        id: 'backend',
        name: '后端代码',
        description: 'Go, Python, Java, C#等',
        extensions: ['.go', '.py', '.java', '.cs', '.php', '.rb', '.rs', '.cpp', '.c', '.h'],
        icon: '⚙️'
    },
    {
        id: 'config',
        name: '配置文件',
        description: 'JSON, YAML, XML, ENV等',
        extensions: ['.json', '.yaml', '.yml', '.xml', '.toml', '.ini', '.env', '.config'],
        icon: '⚙️'
    },
    {
        id: 'docs',
        name: '文档文件',
        description: 'README, 文档等',
        extensions: ['.md', '.txt', '.rst', '.adoc'],
        icon: '📚'
    },
    {
        id: 'build',
        name: '构建工具',
        description: 'package.json, Dockerfile等',
        extensions: ['.dockerfile', 'dockerfile', 'makefile', '.mk'],
        icon: '🔧'
    }
];

interface FilterPanelProps {
    selectedFilters: Set<string>;
    onFilterChange: (filterId: string, selected: boolean) => void;
    onSelectByExtensions: (extensions: string[], add: boolean) => void;
    onClearFilters: () => void;
    onClose?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    selectedFilters,
    onFilterChange,
    onSelectByExtensions,
    onClearFilters,
    onClose
}) => {
    const handlePresetClick = (preset: FilterPreset) => {
        const isSelected = selectedFilters.has(preset.id);
        onSelectByExtensions(preset.extensions, !isSelected);
        onFilterChange(preset.id, !isSelected);
    };

    // 修复动画变体 - 从左到右进入，从右到左退出
    const containerVariants = {
        initial: { 
            opacity: 0, 
            x: -320,
            scale: 0.95
        },
        animate: { 
            opacity: 1, 
            x: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        },
        exit: { 
            opacity: 0, 
            x: -320,
            scale: 0.95,
            transition: { 
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        }
    };

    const itemVariants = {
        initial: { 
            opacity: 0, 
            x: -30,
            y: 10
        },
        animate: { 
            opacity: 1, 
            x: 0,
            y: 0,
            transition: { 
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        },
        exit: {
            opacity: 0,
            x: -20,
            transition: {
                duration: 0.2
            }
        }
    };

    const buttonVariants = {
        hover: { 
            scale: 1.02,
            y: -1,
            transition: { duration: 0.15 }
        },
        tap: { 
            scale: 0.98,
            transition: { duration: 0.1 }
        }
    };

    const quickActionVariants = {
        hover: { 
            scale: 1.03,
            transition: { duration: 0.15 }
        },
        tap: { scale: 0.97 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="glass-effect-strong rounded-xl shadow-2xl overflow-hidden h-full flex flex-col border border-white/20"
        >
            {/* 标题栏 */}
            <motion.div 
                className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10"
                variants={itemVariants}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <motion.div
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Logo size="sm" showText={false} animated={false} />
                        </motion.div>
                        <h3 className="text-lg font-semibold gradient-text">智能过滤</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <motion.button
                            onClick={onClearFilters}
                            className="btn-apple px-3 py-1.5 text-xs glass-effect text-white rounded-lg"
                            variants={quickActionVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            清除
                        </motion.button>
                        {onClose && (
                            <motion.button
                                onClick={onClose}
                                className="btn-apple w-8 h-8 glass-effect text-white rounded-lg flex items-center justify-center"
                                variants={quickActionVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                ✕
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
            
            {/* 滚动内容区域 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-6">
                    {/* 预设模板 */}
                    <motion.div variants={itemVariants}>
                        <div className="text-sm text-gray-300 mb-4 flex items-center space-x-2">
                            <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></span>
                            <span>快速选择预设（支持多选）：</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {filterPresets.map((preset, index) => {
                                const isSelected = selectedFilters.has(preset.id);
                                return (
                                    <motion.button
                                        key={preset.id}
                                        onClick={() => handlePresetClick(preset)}
                                        className={`card-hover glass-effect p-4 rounded-xl border text-left group relative overflow-hidden ${
                                            isSelected 
                                                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-blue-400/50 shadow-lg shadow-blue-500/20' 
                                                : 'border-white/10 hover:border-purple-400/30'
                                        }`}
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ 
                                            opacity: 1, 
                                            y: 0,
                                            transition: { delay: index * 0.03 }
                                        }}
                                    >
                                        {/* 背景光效 */}
                                        {isSelected && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            />
                                        )}
                                        
                                        <div className="relative flex items-start space-x-3">
                                            <motion.span 
                                                className="text-xl flex-shrink-0 mt-1"
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {preset.icon}
                                            </motion.span>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-medium transition-all duration-200 flex items-center space-x-2 ${
                                                    isSelected ? 'text-white' : 'text-white group-hover:text-blue-300'
                                                }`}>
                                                    <span>{preset.name}</span>
                                                    <AnimatePresence>
                                                        {isSelected && (
                                                            <motion.span 
                                                                className="text-xs bg-blue-500/30 px-2 py-0.5 rounded-full"
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                ✓
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {preset.description}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2 font-mono opacity-75">
                                                    {preset.extensions.slice(0, 4).join(', ')}
                                                    {preset.extensions.length > 4 && '...'}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                    
                    {/* 快速操作 */}
                    <motion.div 
                        className="border-t border-white/10 pt-4"
                        variants={itemVariants}
                    >
                        <div className="text-sm text-gray-300 mb-3 flex items-center space-x-2">
                            <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></span>
                            <span>快速选择（累加模式）：</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: '+ JS/TS', extensions: ['.js', '.jsx', '.ts', '.tsx'], color: 'from-yellow-500 to-blue-500' },
                                { label: '+ Go', extensions: ['.go'], color: 'from-cyan-500 to-teal-500' },
                                { label: '+ Python', extensions: ['.py'], color: 'from-yellow-500 to-green-500' },
                                { label: '+ 文档', extensions: ['.md', '.txt'], color: 'from-green-500 to-emerald-500' }
                            ].map((item, index) => (
                                <motion.button
                                    key={item.label}
                                    onClick={() => onSelectByExtensions(item.extensions, true)}
                                    className={`btn-apple px-3 py-2 text-sm bg-gradient-to-r ${item.color} text-white rounded-lg glass-effect`}
                                    variants={quickActionVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ 
                                        opacity: 1, 
                                        scale: 1,
                                        transition: { delay: 0.3 + (index * 0.05) }
                                    }}
                                >
                                    {item.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* 移除操作 */}
                    <motion.div 
                        className="border-t border-white/10 pt-4"
                        variants={itemVariants}
                    >
                        <div className="text-sm text-gray-300 mb-3 flex items-center space-x-2">
                            <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></span>
                            <span>移除选择：</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: '- JS/TS', extensions: ['.js', '.jsx', '.ts', '.tsx'] },
                                { label: '- Go', extensions: ['.go'] },
                                { label: '- Python', extensions: ['.py'] },
                                { label: '- 文档', extensions: ['.md', '.txt'] }
                            ].map((item, index) => (
                                <motion.button
                                    key={item.label}
                                    onClick={() => onSelectByExtensions(item.extensions, false)}
                                    className="btn-apple px-3 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg glass-effect"
                                    variants={quickActionVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ 
                                        opacity: 1, 
                                        scale: 1,
                                        transition: { delay: 0.4 + (index * 0.05) }
                                    }}
                                >
                                    {item.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* 当前选择状态 */}
                    <AnimatePresence>
                        {selectedFilters.size > 0 && (
                            <motion.div 
                                className="border-t border-white/10 pt-4"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-sm text-gray-300 mb-3 flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></span>
                                    <span>已选择的预设：</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <AnimatePresence>
                                        {Array.from(selectedFilters).map(filterId => {
                                            const preset = filterPresets.find(p => p.id === filterId);
                                            return preset ? (
                                                <motion.span
                                                    key={filterId}
                                                    className="inline-flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 glass-effect text-white text-xs rounded-full border border-blue-400/30"
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    layout
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <span>{preset.icon}</span>
                                                    <span>{preset.name}</span>
                                                </motion.span>
                                            ) : null;
                                        })}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}; 