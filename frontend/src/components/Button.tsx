import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    className?: string;
    title?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    disabled = false,
    variant = 'primary',
    size = 'md',
    loading = false,
    className = '',
    title
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'bg-gradient-to-r from-blue-500 to-purple-600';
            case 'secondary':
                return 'bg-gradient-to-r from-gray-500 to-gray-600';
            case 'success':
                return 'bg-gradient-to-r from-green-500 to-emerald-600';
            case 'info':
                return 'bg-gradient-to-r from-cyan-500 to-blue-600';
            case 'warning':
                return 'bg-gradient-to-r from-orange-500 to-yellow-600';
            case 'danger':
                return 'bg-gradient-to-r from-red-500 to-pink-600';
            default:
                return 'bg-gradient-to-r from-blue-500 to-purple-600';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1.5 text-sm';
            case 'md':
                return 'px-6 py-3 text-base';
            case 'lg':
                return 'px-8 py-4 text-lg';
            default:
                return 'px-6 py-3 text-base';
        }
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || loading}
            className={`btn-apple ${getVariantClasses()} ${getSizeClasses()} text-white rounded-xl shadow-lg disabled:opacity-50 font-medium transition-all ${className}`}
            title={title}
            whileHover={{ scale: disabled || loading ? 1 : 1.05, y: disabled || loading ? 0 : -2 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
        >
            {loading ? (
                <div className="flex items-center space-x-2">
                    <div className="loading-spinner w-4 h-4" />
                    <span>加载中...</span>
                </div>
            ) : (
                children
            )}
        </motion.button>
    );
};

export default Button; 