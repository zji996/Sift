import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card.js';

interface ContextPanelProps {
    summary: string;
    onSummaryChange: (summary: string) => void;
    includeReadme: boolean;
    onIncludeReadmeChange: (include: boolean) => void;
    includeDependencies: boolean;
    onIncludeDependenciesChange: (include: boolean) => void;
    includeGitignore: boolean;
    onIncludeGitignoreChange: (include: boolean) => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({
    summary,
    onSummaryChange,
    includeReadme,
    onIncludeReadmeChange,
    includeDependencies,
    onIncludeDependenciesChange,
    includeGitignore,
    onIncludeGitignoreChange
}) => {
    return (
        <Card
            title="AI 上下文设置"
            icon="🤖"
            variant="strong"
            gradientFrom="purple-600/20"
            gradientTo="pink-600/20"
            bodyClassName="p-4 space-y-4"
        >
            {/* 项目摘要输入 */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                    项目摘要/问题描述
                </label>
                <textarea
                    value={summary}
                    onChange={(e) => onSummaryChange(e.target.value)}
                    placeholder="请描述你的项目或想要AI帮助解决的问题，例如：&#10;- 我正在重构React组件，希望提升性能&#10;- 遇到了构建错误，需要帮助分析&#10;- 想要添加新功能，需要代码建议"
                    className="w-full h-24 p-3 bg-black/20 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent custom-scrollbar"
                />
            </div>

            {/* 上下文文件选择 */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                    自动包含上下文文件
                </label>
                
                <div className="space-y-2">
                    <motion.label 
                        className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <input
                            type="checkbox"
                            checked={includeReadme}
                            onChange={(e) => onIncludeReadmeChange(e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-300">
                            📖 README.md (项目说明)
                        </span>
                    </motion.label>

                    <motion.label 
                        className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <input
                            type="checkbox"
                            checked={includeDependencies}
                            onChange={(e) => onIncludeDependenciesChange(e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-300">
                            📦 依赖文件 (package.json, go.mod, requirements.txt 等)
                        </span>
                    </motion.label>

                    <motion.label 
                        className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <input
                            type="checkbox"
                            checked={includeGitignore}
                            onChange={(e) => onIncludeGitignoreChange(e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-300">
                            🚫 .gitignore (忽略规则)
                        </span>
                    </motion.label>
                </div>
            </div>

            {/* 提示信息 */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                    <span className="text-blue-400 text-sm">💡</span>
                    <div className="text-xs text-blue-300">
                        <p className="font-medium mb-1">提示：</p>
                        <ul className="space-y-1 text-blue-200/80">
                            <li>• 详细的项目描述能帮助AI更好地理解你的需求</li>
                            <li>• 包含相关上下文文件可以提供更准确的建议</li>
                            <li>• 生成的统一prompt可以直接复制给任何AI助手</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ContextPanel;
