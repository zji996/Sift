import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    icon?: string;
    headerActions?: React.ReactNode;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
    variant?: 'default' | 'strong';
    gradientFrom?: string;
    gradientTo?: string;
}

const Card: React.FC<CardProps> = ({
    children,
    title,
    icon,
    headerActions,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    variant = 'default',
    gradientFrom = 'purple-600/20',
    gradientTo = 'blue-600/20'
}) => {
    const cardVariants = {
        initial: { y: 20, opacity: 0, scale: 0.95 },
        animate: { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            transition: { 
                type: "spring",
                damping: 25,
                stiffness: 200
            }
        }
    };

    const glassClass = variant === 'strong' ? 'glass-effect-strong' : 'glass-effect';

    return (
        <motion.div 
            className={`flex flex-col ${glassClass} rounded-2xl shadow-2xl overflow-hidden border border-white/10 ${className}`}
            variants={cardVariants}
            layout
        >
            {title && (
                <div className={`flex-shrink-0 p-4 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} border-b border-white/10 ${headerClassName}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {icon && (
                                <motion.div
                                    className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                >
                                    <span className="text-sm">{icon}</span>
                                </motion.div>
                            )}
                            <h2 className="text-lg font-semibold gradient-text">{title}</h2>
                        </div>
                        {headerActions && (
                            <div className="flex items-center space-x-2">
                                {headerActions}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className={`flex-1 ${bodyClassName}`}>
                {children}
            </div>
        </motion.div>
    );
};

export default Card; 