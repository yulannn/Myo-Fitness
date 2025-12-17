import { useToastStore } from '../../stores/useToastStore';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import type { Toast, ToastType } from '../../stores/useToastStore';

const TOAST_ICONS: Record<ToastType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
};

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
    success: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/50',
        text: 'text-green-400',
        icon: 'text-green-400',
    },
    error: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/50',
        text: 'text-red-400',
        icon: 'text-red-400',
    },
    warning: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
        icon: 'text-yellow-400',
    },
    info: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/50',
        text: 'text-blue-400',
        icon: 'text-blue-400',
    },
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-[9998] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const [isExiting, setIsExiting] = useState(false);
    const Icon = TOAST_ICONS[toast.type];
    const styles = TOAST_STYLES[toast.type];

    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => {
                setIsExiting(true);
                setTimeout(onClose, 300);
            }, toast.duration - 300);

            return () => clearTimeout(timer);
        }
    }, [toast.duration, onClose]);

    return (
        <div
            className={`
                ${styles.bg} ${styles.border} border backdrop-blur-xl rounded-2xl p-4 
                shadow-2xl pointer-events-auto transition-all duration-300
                ${isExiting
                    ? 'translate-x-[120%] opacity-0'
                    : 'translate-x-0 opacity-100'
                }
            `}
        >
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 ${styles.icon}`} />
                <p className={`flex-1 text-sm font-medium ${styles.text}`}>
                    {toast.message}
                </p>
                <button
                    onClick={() => {
                        setIsExiting(true);
                        setTimeout(onClose, 300);
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
