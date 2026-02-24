import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface NotificationItem {
    id: string;
    message: string;
    link: string;
    createdAt: Date;
}

interface NotificationContextType {
    notifications: NotificationItem[];
    addNotification: (payload: { message: string; link: string }) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function generateId(): string {
    return `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const addNotification = useCallback((payload: { message: string; link: string }) => {
        const item: NotificationItem = {
            id: generateId(),
            message: payload.message,
            link: payload.link,
            createdAt: new Date(),
        };
        setNotifications((prev) => [item, ...prev]);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider
            value={{ notifications, addNotification, removeNotification }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (ctx === undefined) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return ctx;
}
