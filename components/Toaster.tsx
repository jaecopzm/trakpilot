'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    description?: string;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType, description?: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info', description?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type, description }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const icons = {
        success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
        error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
        info: <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
    };

    const bgColors = {
        success: 'border-emerald-500/20 bg-emerald-500/5',
        error: 'border-red-500/20 bg-red-500/5',
        info: 'border-blue-500/20 bg-blue-500/5',
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-xl animate-in slide-in-from-right-5 fade-in duration-300 ${bgColors[t.type]}`}
                    >
                        {icons[t.type]}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{t.message}</p>
                            {t.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
