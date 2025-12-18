import { create } from 'zustand';

export interface BadgeToast {
    id: string;
    badge: {
        id: number;
        name: string;
        description: string;
        icon: string;
        tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGENDARY';
        xpReward: number;
    };
}

interface BadgeToastStore {
    toasts: BadgeToast[];
    addBadgeToast: (badge: any) => void;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;
}

// Mapping des icônes par défaut basées sur le code du badge
// Ces icônes seront remplacées plus tard par de vraies images
const DEFAULT_BADGE_ICONS: Record<string, string> = {
    // Badges de sessions
    'FIRST_SESSION': '🏆',
    'SESSIONS_10': '💪',
    'SESSIONS_50': '🔥',
    'SESSIONS_100': '⭐',
    'SESSIONS_500': '👑',

    // Badges de temps
    'EARLY_BIRD': '🌅',
    'NIGHT_OWL': '🦉',

    // Badges de volume
    'VOLUME_10000': '💎',
    'VOLUME_100000': '🏅',

    // Badge semaine parfaite
    'PERFECT_WEEK': '✨',

    // Icône par défaut
    'DEFAULT': '🎖️',
};

// Fonction pour obtenir l'icône d'un badge
function getBadgeIcon(badge: any): string {
    // Si le badge a déjà une icône, l'utiliser
    if (badge.icon) {
        return badge.icon;
    }

    // Sinon, utiliser le mapping basé sur le code
    if (badge.code && DEFAULT_BADGE_ICONS[badge.code]) {
        return DEFAULT_BADGE_ICONS[badge.code];
    }

    // Icône par défaut
    return DEFAULT_BADGE_ICONS['DEFAULT'];
}

export const useBadgeToastStore = create<BadgeToastStore>((set) => ({
    toasts: [],
    addBadgeToast: (badgeData: any) => {
        // Le badge peut venir soit directement (test), soit de l'API (badgeData.badge)
        const badge = badgeData.badge || badgeData;

        const toastId = `badge-${badge.id}-${Date.now()}`;
        const newToast: BadgeToast = {
            id: toastId,
            badge: {
                ...badge,
                icon: getBadgeIcon(badge), // Ajouter l'icône par défaut si nécessaire
            },
        };

        set((state) => ({
            toasts: [...state.toasts, newToast],
        }));

        // Auto-remove after 5 seconds
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== toastId),
            }));
        }, 3500);
    },
    removeToast: (id: string) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
    clearAllToasts: () => set({ toasts: [] }),
}));
