import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    addToast: (type, message, duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, type, message, duration };

        set((state) => ({
            toasts: [...state.toasts, toast],
        }));

        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, duration);
        }
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),

    // Helpers pour simplifier l'utilisation
    success: (message, duration) => {
        useToastStore.getState().addToast('success', message, duration);
    },

    error: (message, duration) => {
        useToastStore.getState().addToast('error', message, duration);
    },

    warning: (message, duration) => {
        useToastStore.getState().addToast('warning', message, duration);
    },

    info: (message, duration) => {
        useToastStore.getState().addToast('info', message, duration);
    },
}));
