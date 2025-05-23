import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo.js';

interface EmptyStateProps {
    onSelectDirectory: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectDirectory }) => {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-16 space-y-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {/* Logo */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
            >
                <Logo size="xl" showText={true} animated={true} />
            </motion.div>

            {/* 描述文本 */}
            <motion.div
                className="space-y-4 max-w-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                <h2 className="text-2xl font-semibold text-gray-300">
                    欢迎使用 Sift
                </h2>
                <p className="text-gray-400 leading-relaxed">
                    一个强大的AI项目文件整理工具，帮助您快速分析和整理项目结构，让复杂的代码目录变得井井有条。
                </p>
            </motion.div>

            {/* 功能特点 */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
            >
                <div className="glass-effect p-4 rounded-xl text-center space-y-2">
                    <div className="text-2xl">🗂️</div>
                    <h3 className="font-medium text-gray-300">智能分析</h3>
                    <p className="text-sm text-gray-400">自动识别文件类型和项目结构</p>
                </div>
                <div className="glass-effect p-4 rounded-xl text-center space-y-2">
                    <div className="text-2xl">🔍</div>
                    <h3 className="font-medium text-gray-300">智能过滤</h3>
                    <p className="text-sm text-gray-400">按文件类型快速筛选所需内容</p>
                </div>
                <div className="glass-effect p-4 rounded-xl text-center space-y-2">
                    <div className="text-2xl">📋</div>
                    <h3 className="font-medium text-gray-300">一键复制</h3>
                    <p className="text-sm text-gray-400">生成结构化输出，方便AI理解</p>
                </div>
            </motion.div>

            {/* 行动按钮 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
            >
                <motion.button
                    onClick={onSelectDirectory}
                    className="btn-apple px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg font-medium text-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="flex items-center space-x-3">
                        <span>📁</span>
                        <span>选择项目目录</span>
                    </div>
                </motion.button>
            </motion.div>

            {/* 提示文本 */}
            <motion.p
                className="text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                点击上方按钮开始整理您的项目文件
            </motion.p>
        </motion.div>
    );
}; 