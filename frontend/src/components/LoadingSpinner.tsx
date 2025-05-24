import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo.js';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    showLogo?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    message = "加载中...", 
    size = 'md',
    showLogo = true 
}) => {
    const getSpinnerSize = () => {
        switch (size) {
            case 'sm':
                return 'w-4 h-4';
            case 'md':
                return 'w-6 h-6';
            case 'lg':
                return 'w-8 h-8';
            default:
                return 'w-6 h-6';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'sm':
                return 'py-4';
            case 'md':
                return 'py-8';
            case 'lg':
                return 'py-12';
            default:
                return 'py-8';
        }
    };

    return (
        <motion.div
            className={`flex flex-col items-center justify-center ${getPadding()} space-y-4`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
        >
            {showLogo && size !== 'sm' && (
                <Logo size="md" showText={false} animated={true} />
            )}
            <div className={`loading-spinner ${getSpinnerSize()}`} />
            <motion.p 
                className="text-gray-400 text-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                {message}
            </motion.p>
        </motion.div>
    );
};

export default LoadingSpinner; 