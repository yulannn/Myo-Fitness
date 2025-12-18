// 🎯 BODY ATLAS Types

export const MuscleCategory = {
    CHEST: 'CHEST',
    BACK: 'BACK',
    SHOULDERS: 'SHOULDERS',
    ARMS: 'ARMS',
    LEGS: 'LEGS',
    CORE: 'CORE',
    OTHER: 'OTHER'
} as const;

export type MuscleCategory = typeof MuscleCategory[keyof typeof MuscleCategory];

export const MuscleHeat = {
    HOT: 'HOT',       // 0-72h (récemment travaillé)
    WARM: 'WARM',     // 72h-120h (prêt à retravailler)
    COLD: 'COLD',     // 120h+ (négligé)
    FROZEN: 'FROZEN'  // 7j+ (perd du niveau)
} as const;

export type MuscleHeat = typeof MuscleHeat[keyof typeof MuscleHeat];

// Interfaces
export interface UserMuscleStats {
    id: number;
    userId: number;
    muscleGroupId: number;
    totalVolume: number;
    level: number; // 0-5
    lastTrainedAt: Date | null;
    heat: MuscleHeat;
    createdAt: Date;
    updatedAt: Date;
    muscleGroup?: MuscleGroup;
}

export interface MuscleGroup {
    id: number;
    name: string;
    category: MuscleCategory;
}

// API Response types
export interface BodyAtlasData {
    muscleStats: UserMuscleStats[];
    overallScore: number; // 0-100
    balanceScore: number; // 0-100
    dominantMuscles: string[];
    weakMuscles: string[];
}
