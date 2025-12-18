// 🎯 BODY ATLAS Backend Types
export * from './body-atlas.type';


export interface UpdateMuscleStatsDto {
    sessionId: number;
    performances: Array<{
        muscleGroupId: number;
        volume: number; // reps × weight
        sets: number;
    }>;
}
