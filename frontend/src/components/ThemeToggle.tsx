import React from 'react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => (
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

export default ThemeToggle; 