import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card.js';
import Button from './Button.js';
import LoadingSpinner from './LoadingSpinner.js';
import DirectoryTreeNode from './DirectoryTreeNode.js';
import { DirectoryEntry } from '../types/index.js';

interface FileTreePanelProps {
    tree: DirectoryEntry[];
    selectedPaths: Set<string>;
    onToggleSelect: (path: string, isDir: boolean, children?: DirectoryEntry[]) => void;
    onToggleFilterPanel: () => void;
    onSelectAll: () => void;
    showFilterPanel: boolean;
    rootDir: string | null;
    isLoading: boolean;
    isAllSelected: boolean;
}

const FileTreePanel: React.FC<FileTreePanelProps> = ({
    tree,
    selectedPaths,
    onToggleSelect,
    onToggleFilterPanel,
    onSelectAll,
    showFilterPanel,
    rootDir,
    isLoading,
    isAllSelected
}) => {
    const filterButton = (
        <motion.button
            onClick={onToggleFilterPanel}
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
    );

    const selectAllButton = (
        <Button
            onClick={onSelectAll}
            disabled={!rootDir || isLoading || tree.length === 0}
            variant="success"
            size="sm"
        >
            {isAllSelected ? '取消全选' : '全选'}
        </Button>
    );

    const headerActions = (
        <div className="flex items-center space-x-2">
            {filterButton}
            {selectAllButton}
        </div>
    );

    return (
        <Card
            title="文件树"
            icon="🌳"
            headerActions={headerActions}
            variant="strong"
            bodyClassName="p-4 overflow-y-scroll custom-scrollbar"
        >
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
                                    onToggleSelect={onToggleSelect}
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
        </Card>
    );
};

export default FileTreePanel; 