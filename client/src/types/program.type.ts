export interface Exercise {
    id: number;
    name: string;
    sets?: number;
    reps?: number;
    notes?: string | null;
}

export interface Session {
    id: number;
    date?: string | null;
    duration?: number | null;
    completed?: boolean;
    notes?: string | null;
    exercices?: Exercise[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Program {
    id: number;
    name: string;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
    fitnessProfileId?: number;
    sessions?: Session[];
}