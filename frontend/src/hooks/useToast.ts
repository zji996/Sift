import { useState, useCallback } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newToast: Toast = { id, message, type };
        
        setToasts(prev => {
            // 限制最多保留3个Toast，移除最老的
            const newToasts = [...prev, newToast];
            return newToasts.slice(-3);
        });
        
        // Auto remove after 2.5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 2500);
        
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message: string) => {
        return addToast(message, 'success');
    }, [addToast]);

    const showError = useCallback((message: string) => {
        return addToast(message, 'error');
    }, [addToast]);

    const showInfo = useCallback((message: string) => {
        return addToast(message, 'info');
    }, [addToast]);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        clearAllToasts
    };
}; 