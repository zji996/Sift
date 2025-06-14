import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo.js';
import ThemeToggle from './ThemeToggle.js';
import Button from './Button.js';
import StatusBar from './StatusBar.js';

interface HeaderProps {
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onSelectDirectory: () => void;
    onGenerateOutput: () => void;
    onCopyAll: () => void;
    isLoading: boolean;
    isGenerating: boolean;
    rootDir: string | null;
    selectedPathsSize: number;
    totalPathsCount: number;
    error: string | null;
    hasOutput: boolean;
    showParticles: boolean;
    onToggleParticles: () => void;
}

const Header: React.FC<HeaderProps> = ({
    isDarkMode,
    onToggleTheme,
    onSelectDirectory,
    onGenerateOutput,
    onCopyAll,
    isLoading,
    isGenerating,
    rootDir,
    selectedPathsSize,
    totalPathsCount,
    error,
    hasOutput,
    showParticles,
    onToggleParticles
}) => {
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

    return (
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
                        <ThemeToggle isDark={isDarkMode} onToggle={onToggleTheme} />
                    </motion.div>

                    {/* 粒子效果开关按钮 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 }}
                    >
                        <Button
                            onClick={onToggleParticles}
                            variant={showParticles ? "info" : "secondary"}
                            size="sm"
                            title={showParticles ? "关闭粒子效果" : "开启粒子效果"}
                        >
                            {showParticles ? "✨" : "💫"}
                        </Button>
                    </motion.div>
                    
                    <Button
                        onClick={onSelectDirectory}
                        disabled={isLoading}
                        loading={isLoading && !rootDir}
                        variant="primary"
                    >
                        选择项目目录
                    </Button>
                    
                    <Button
                        onClick={onGenerateOutput}
                        disabled={isGenerating || !rootDir || selectedPathsSize === 0}
                        loading={isGenerating}
                        variant="success"
                    >
                        生成输出
                    </Button>
                    
                    <Button
                        onClick={onCopyAll}
                        disabled={!hasOutput}
                        variant="info"
                    >
                        复制全部
                    </Button>
                </div>
            </div>
            
            {/* 状态栏 */}
            <StatusBar
                rootDir={rootDir}
                selectedCount={selectedPathsSize}
                totalCount={totalPathsCount}
                error={error}
            />
        </motion.header>
    );
};

export default Header; 