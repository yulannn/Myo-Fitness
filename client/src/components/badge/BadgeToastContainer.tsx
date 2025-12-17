import { useBadgeToastStore } from '../../stores/useBadgeToastStore';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import './BadgeToastContainer.css';

const TIER_COLORS = {
    BRONZE: {
        gradient: 'from-amber-700 via-amber-600 to-amber-700',
        glow: 'shadow-amber-500/50',
        text: 'text-amber-400',
        border: 'border-amber-500/50',
    },
    SILVER: {
        gradient: 'from-gray-400 via-gray-300 to-gray-400',
        glow: 'shadow-gray-400/50',
        text: 'text-gray-300',
        border: 'border-gray-400/50',
    },
    GOLD: {
        gradient: 'from-yellow-500 via-yellow-400 to-yellow-500',
        glow: 'shadow-yellow-400/60',
        text: 'text-yellow-400',
        border: 'border-yellow-400/50',
    },
    PLATINUM: {
        gradient: 'from-cyan-400 via-blue-300 to-cyan-400',
        glow: 'shadow-cyan-300/60',
        text: 'text-cyan-300',
        border: 'border-cyan-400/50',
    },
    LEGENDARY: {
        gradient: 'from-purple-500 via-pink-500 to-purple-500',
        glow: 'shadow-purple-500/70',
        text: 'text-purple-400',
        border: 'border-purple-500/50',
    },
};

export default function BadgeToastContainer() {
    const { toasts, removeToast } = useBadgeToastStore();

    return (
        <div className="badge-toast-container">
            {toasts.map((toast) => (
                <BadgeToast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

interface BadgeToastProps {
    toast: {
        id: string;
        badge: {
            id: number;
            name: string;
            description: string;
            icon: string;
            tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGENDARY';
            xpReward: number;
        };
    };
    onClose: () => void;
}

function BadgeToast({ toast, onClose }: BadgeToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const tierStyle = TIER_COLORS[toast.badge.tier];

    useEffect(() => {
        // Start exit animation 500ms before removal
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 5500);

        return () => clearTimeout(exitTimer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    return (
        <div
            className={`badge-toast ${isExiting ? 'badge-toast-exit' : 'badge-toast-enter'}`}
            onClick={handleClose}
        >
            {/* Glow Effect */}
            <div className={`badge-toast-glow bg-gradient-to-r ${tierStyle.gradient}`}></div>

            {/* Border Animation */}
            <div className={`badge-toast-border border-2 ${tierStyle.border}`}></div>

            {/* Content */}
            <div className="badge-toast-content">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="badge-toast-close"
                    aria-label="Fermer"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Badge Icon */}
                <div className={`badge-toast-icon bg-gradient-to-br ${tierStyle.gradient} ${tierStyle.glow}`}>
                    <span className="text-4xl" role="img" aria-label={toast.badge.name}>
                        {toast.badge.icon}
                    </span>
                    {/* Sparkles */}
                    <div className="badge-toast-sparkles">
                        <SparklesIcon className={`w-6 h-6 ${tierStyle.text}`} />
                    </div>
                </div>

                {/* Info */}
                <div className="badge-toast-info">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="badge-toast-title">Badge débloqué !</span>
                        <span className={`badge-toast-tier ${tierStyle.text}`}>{toast.badge.tier}</span>
                    </div>
                    <h3 className="badge-toast-badge-name">{toast.badge.name}</h3>
                    <p className="badge-toast-description">{toast.badge.description}</p>
                    {toast.badge.xpReward > 0 && (
                        <div className="badge-toast-xp">
                            <SparklesIcon className="w-4 h-4" />
                            <span>+{toast.badge.xpReward} XP</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Confetti particles */}
            <div className="badge-toast-confetti">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`confetti confetti-${i + 1}`} />
                ))}
            </div>
        </div>
    );
}
