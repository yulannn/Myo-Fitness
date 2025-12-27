export interface ExerciseData {
    id: number;
    sets?: number;
    reps?: number;
    weight?: number;
}

export interface Session {
    id: number;
    programId: number;
    date?: string;
    performedAt?: string;
    duration?: number;
    sessionName?: string | null;
    exercices?: any[];
    trainingProgram?: any;
    completed: boolean;
    createdAt?: string;
    updatedAt?: string;
    summary?: SessionSummary;
}

export interface SessionSummary {
    id: number;
    sessionId: number;
    totalSets: number;
    totalReps: number;
    totalVolume: number;
    avgRPE: number;
    caloriesBurned?: number; // 🔥 Calories brûlées estimées
    duration: number;
    muscleGroups: string[];
    createdAt: string;
}

export interface UpdateSessionDatePayload {
    date: string;
}

export interface AddExerciseToSessionPayload {
    id: number;
    sets?: number;
    reps?: number;
    weight?: number;
}

