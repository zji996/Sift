import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card.js';
import { DirectoryEntry } from '../types/index.js';
import { formatBytes } from '../utils/formatUtils.js';

interface FileSizePanelProps {
    filesBySize: DirectoryEntry[];
    selectedPaths: Set<string>;
    onToggleSelect: (path: string, isDir: boolean, children?: DirectoryEntry[]) => void;
}

// 单个文件项组件
const FileItem: React.FC<{
    file: DirectoryEntry;
    index: number;
    isSelected: boolean;
    onToggleSelect: (path: string, isDir: boolean, children?: DirectoryEntry[]) => void;
}> = ({ file, index, isSelected, onToggleSelect }) => {
    return (
        <motion.div
            className={`
                relative flex justify-between items-center p-3 rounded-lg border 
                transition-all duration-200 cursor-pointer group
                ${isSelected 
                    ? 'bg-gradient-to-r from-blue-600/25 to-purple-600/25 border-blue-500/40 shadow-lg shadow-blue-500/10' 
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/70 hover:border-blue-400/60'
                }
            `}
            onClick={() => onToggleSelect(file.path, file.isDir, file.children)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02, duration: 0.3 }}
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
        >
            {/* 选中状态指示器 */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: isSelected ? 1 : 0 }}
                transition={{ duration: 0.2 }}
            />
            
            {/* 文件名 */}
            <span className="file-item-text truncate text-sm font-medium flex-1 pr-3 transition-colors duration-200">
                {file.name}
            </span>
            
            {/* 文件大小标签 */}
            <div
                className="
                    file-size-text flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-mono font-semibold
                    border transition-all duration-200
                    bg-blue-500/20 border-blue-400/40 
                    hover:bg-blue-500/30 hover:border-blue-400/60
                    shadow-sm hover:shadow-md
                "
                style={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(96, 165, 250, 0.4)'
                }}
            >
                {formatBytes(file.size || 0)}
            </div>
            
            {/* 悬浮光效 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.2 }}
            />
        </motion.div>
    );
};

// 主组件
export const FileSizePanel: React.FC<FileSizePanelProps> = ({
    filesBySize,
    selectedPaths,
    onToggleSelect
}) => {
    const headerActions = (
        <span className="muted-text text-xs px-2 py-1 rounded-full bg-gray-600/20">
            前50
        </span>
    );

    return (
        <Card
            title="文件大小排序"
            icon="📊"
            variant="strong"
            gradientFrom="orange-600/20"
            gradientTo="red-600/20"
            headerActions={headerActions}
            bodyClassName="p-4 overflow-y-auto custom-scrollbar"
            className="file-size-panel"
        >
            <AnimatePresence mode="wait">
                {filesBySize.length > 0 ? (
                    <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {filesBySize.slice(0, 50).map((file, index) => (
                            <FileItem
                                key={`${file.path}-${index}`}
                                file={file}
                                index={index}
                                isSelected={selectedPaths.has(file.path)}
                                onToggleSelect={onToggleSelect}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="text-6xl mb-4">📊</div>
                        <p className="muted-text">无文件可显示</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}; 