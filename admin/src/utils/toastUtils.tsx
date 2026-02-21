import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

// --- Types ---
interface ConfirmOptions {
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    icon?: React.ReactNode;
}

// --- Event Bus for loose coupling ---
type ConfirmEvent = ConfirmOptions & { id: number };
let confirmListeners: ((options: ConfirmEvent | null) => void)[] = [];

const notifyListeners = (options: ConfirmEvent | null) => {
    confirmListeners.forEach(l => l(options));
};

// --- Public API ---
export const confirmToast = (options: ConfirmOptions) => {
    notifyListeners({ ...options, id: Date.now() });
};

// --- Component ---
export const GlobalConfirmDialog: React.FC = () => {
    const [config, setConfig] = useState<ConfirmEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const listener = (options: ConfirmEvent | null) => {
            if (options) {
                setConfig(options);
                // Minimal delay to allow render before animation
                setTimeout(() => setIsVisible(true), 10);
            } else {
                setIsVisible(false);
                setTimeout(() => setConfig(null), 300); // Wait for exit animation
            }
        };
        confirmListeners.push(listener);
        return () => {
            confirmListeners = confirmListeners.filter(l => l !== listener);
        };
    }, []);

    const handleClose = () => {
        if (isLoading) return;
        setIsVisible(false);
        setTimeout(() => setConfig(null), 300);
    };

    const handleConfirm = async () => {
        if (!config) return;
        try {
            setIsLoading(true);
            await config.onConfirm();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            handleClose();
        }
    };

    if (!config && !isVisible) return null;

    // Determined Icon based on type
    const getIcon = () => {
        if (config?.icon) return config.icon;
        switch (config?.type) {
            case 'danger': return <AlertTriangle size={32} />;
            case 'warning': return <Info size={32} />;
            case 'info': return <CheckCircle2 size={32} />;
            default: return <AlertTriangle size={32} />;
        }
    };

    const getColorClasses = () => {
        switch (config?.type) {
            case 'danger': return {
                bgIcon: 'bg-red-50', textIcon: 'text-red-500',
                btn: 'bg-red-500 hover:bg-red-600 shadow-red-200 focus:ring-red-100'
            };
            case 'warning': return {
                bgIcon: 'bg-amber-50', textIcon: 'text-amber-500',
                btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 focus:ring-amber-100'
            };
            case 'info': return {
                bgIcon: 'bg-blue-50', textIcon: 'text-blue-500',
                btn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200 focus:ring-blue-100'
            };
            default: return {
                bgIcon: 'bg-red-50', textIcon: 'text-red-500',
                btn: 'bg-red-500 hover:bg-red-600 shadow-red-200 focus:ring-red-100'
            };
        }
    };

    const colors = getColorClasses();

    return (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/50 backdrop-blur-sm opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
                }`}
        >
            <div
                className={`bg-white rounded-[2rem] shadow-2xl w-full max-w-lg transform transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
                    }`}
            >
                <div className="p-8 pb-6 flex flex-col items-center text-center">
                    {/* Close button absolute */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white ${colors.bgIcon} ${colors.textIcon}`}>
                        {getIcon()}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Xác nhận hành động
                    </h3>
                    <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
                        {config?.message}
                    </p>
                </div>

                <div className="p-8 pt-2 grid grid-cols-2 gap-4">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all focus:ring-4 focus:ring-gray-50 outline-none disabled:opacity-50"
                    >
                        {config?.cancelText || 'Hủy bỏ'}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-6 py-3.5 rounded-xl text-white font-bold shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 focus:ring-4 outline-none disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-2 ${colors.btn}`}
                    >
                        {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {config?.confirmText || 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
};
