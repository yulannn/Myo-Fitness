export enum LeaderboardType {
    TOTAL_SESSIONS = 'TOTAL_SESSIONS',
    CURRENT_STREAK = 'CURRENT_STREAK',
    LEVEL = 'LEVEL',
    TOTAL_VOLUME = 'TOTAL_VOLUME',
}

export interface LeaderboardEntry {
    userId: number;
    userName: string;
    profilePictureUrl?: string | null;
    rank: number;
    value: number;
    level?: number;
    isCurrentUser: boolean;
}

export interface LeaderboardResponse {
    type: LeaderboardType;
    entries: LeaderboardEntry[];
    currentUserRank?: number;
    totalParticipants: number;
}

export interface LeaderboardTypeInfo {
    type: string;
    label: string;
    description: string;
}
