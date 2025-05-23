import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/images/sift-logo.png';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    animated?: boolean;
    className?: string;
    onClick?: () => void;
}

const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
};

const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
};

export const Logo: React.FC<LogoProps> = ({ 
    size = 'md', 
    showText = true, 
    animated = true,
    className = '',
    onClick 
}) => {
    const logoContent = (
        <div className={`flex items-center space-x-3 ${className}`}>
            <motion.div 
                className={`${sizeClasses[size]} rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden`}
                whileHover={animated ? { rotate: 5, scale: 1.05 } : {}}
                transition={{ duration: 0.2 }}
            >
                <img 
                    src={logoImg} 
                    alt="Sift Logo" 
                    className="w-full h-full object-contain"
                    style={{ filter: 'brightness(1.1)' }}
                />
            </motion.div>
            {showText && (
                <div>
                    <h1 className={`${textSizeClasses[size]} font-bold gradient-text`}>Sift</h1>
                    {(size === 'lg' || size === 'xl') && (
                        <p className="text-sm text-gray-400">AI项目文件整理工具</p>
                    )}
                </div>
            )}
        </div>
    );

    if (onClick) {
        return (
            <motion.button
                onClick={onClick}
                className="focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-xl"
                whileHover={animated ? { scale: 1.02 } : {}}
                whileTap={animated ? { scale: 0.98 } : {}}
            >
                {logoContent}
            </motion.button>
        );
    }

    return animated ? (
        <motion.div
            whileHover={{ scale: 1.02 }}
        >
            {logoContent}
        </motion.div>
    ) : logoContent;
}; 