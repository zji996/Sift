import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusBarProps {
    rootDir: string | null;
    selectedCount: number;
    totalCount: number;
    error: string | null;
}

const StatusBar: React.FC<StatusBarProps> = ({
    rootDir,
    selectedCount,
    totalCount,
    error
}) => {
    return (
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
                {totalCount > 0 && (
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>已选择: {selectedCount} / {totalCount} 项</span>
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
    );
};

export default StatusBar; 