import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
    message, 
    type, 
    show, 
    onClose, 
    duration = 2000
}) => {
    const [isVisible, setIsVisible] = useState(show);
    const timeoutRef = useRef<number | null>(null);
    const isInitializedRef = useRef(false);

    // 使用 useCallback 稳定化 onClose 函数
    const stableOnClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (show && !isInitializedRef.current) {
            isInitializedRef.current = true;
            setIsVisible(true);

            // 设置定时器关闭Toast
            timeoutRef.current = setTimeout(() => {
                setIsVisible(false);
                setTimeout(stableOnClose, 300);
            }, duration);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [show, duration, stableOnClose]);

    // 清理函数
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!show && !isVisible) return null;

    const typeStyles = {
        success: {
            bg: 'from-emerald-500/80 to-green-600/80',
            border: 'border-emerald-400/50',
            icon: '✓',
            iconBg: 'bg-emerald-400/20'
        },
        error: {
            bg: 'from-red-500/80 to-rose-600/80',
            border: 'border-red-400/50',
            icon: '✕',
            iconBg: 'bg-red-400/20'
        },
        info: {
            bg: 'from-blue-500/80 to-cyan-600/80',
            border: 'border-blue-400/50',
            icon: 'ℹ',
            iconBg: 'bg-blue-400/20'
        }
    };

    const currentStyle = typeStyles[type];

    // 简化并优化垂直动画，避免3D效果重叠
    const toastVariants = {
        initial: { 
            opacity: 0, 
            scale: 0.9, 
            y: 30,
            x: 20
        },
        animate: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: 0,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.4
            }
        },
        exit: { 
            opacity: 0, 
            scale: 0.95, 
            y: -10,
            x: 20,
            transition: {
                duration: 0.25,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    variants={toastVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="pointer-events-auto"
                    layout
                >
                    <div className={`glass-effect-strong relative bg-gradient-to-r ${currentStyle.bg} text-white rounded-xl shadow-2xl border ${currentStyle.border} overflow-hidden backdrop-blur-xl min-w-[300px] max-w-[400px]`}>
                        {/* 背景光效 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                        
                        {/* 主内容 */}
                        <div className="relative flex items-center space-x-4 p-4">
                            {/* 图标容器 */}
                            <motion.div 
                                className={`flex-shrink-0 w-10 h-10 ${currentStyle.iconBg} rounded-full flex items-center justify-center backdrop-blur-sm`}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                    delay: 0.2,
                                    type: "spring",
                                    damping: 15,
                                    stiffness: 300
                                }}
                            >
                                <span className="text-lg font-bold text-white">
                                    {currentStyle.icon}
                                </span>
                            </motion.div>

                            {/* 消息内容 */}
                            <div className="flex-1">
                                <motion.p 
                                    className="text-sm font-medium leading-relaxed break-words text-white/95"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.3 }}
                                >
                                    {message}
                                </motion.p>
                            </div>

                            {/* 关闭按钮 */}
                            <motion.button
                                onClick={() => {
                                    setIsVisible(false);
                                    setTimeout(stableOnClose, 300);
                                }}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 text-white/80 hover:text-white group"
                                title="关闭"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <span className="text-sm transition-transform duration-200 group-hover:rotate-90">
                                    ✕
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

interface ToastManagerProps {
    toasts: Array<{
        id: string;
        message: string;
        type: 'success' | 'error' | 'info';
    }>;
    onRemoveToast: (id: string) => void;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onRemoveToast }) => {
    return (
        <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.slice(-3).map((toast, index) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 30, x: 20 }}
                        animate={{ 
                            opacity: 1 - (index * 0.15), 
                            scale: 1 - (index * 0.03), 
                            y: -(index * 10),
                            x: index * 4
                        }}
                        exit={{ 
                            opacity: 0, 
                            scale: 0.95, 
                            y: -10,
                            x: 20,
                            transition: { duration: 0.25 }
                        }}
                        transition={{ 
                            type: "spring",
                            damping: 20,
                            stiffness: 300,
                            duration: 0.4
                        }}
                    >
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            show={true}
                            onClose={() => onRemoveToast(toast.id)}
                            duration={2000 + (index * 500)} // 后面的Toast显示更久
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}; 