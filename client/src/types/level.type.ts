export interface Level {
    id: number;
    userId: number;
    level: number;
    experience: number;
    nextLevelExp: number;
    createdAt: string;
    updatedAt: string;
}

export interface LevelStats {
    level: number;
    experience: number;
    nextLevelExp: number;
    progressPercentage: number;
    totalSessions?: number;
    totalExperience?: number;
}
