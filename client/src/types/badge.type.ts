export interface Badge {
    id: number;
    code: string;
    name: string;
    description: string;
    category: string;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGENDARY';
    iconUrl: string | null;
    xpReward: number;
    requirement: any;
    isSecret: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserBadge {
    id: number;
    userId: number;
    badgeId: number;
    unlockedAt: string;
    badge: Badge;
}
