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
    duration?: number;
    notes?: string | null;
    exercices?: any[];
    trainingProgram?: any;
    completed: boolean;
    createdAt?: string;
    updatedAt?: string;
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

