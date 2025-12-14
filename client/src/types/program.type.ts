export interface Exercise {
    id: number;
    name: string;
    sets?: number;
    reps?: number;
    sessionName?: string | null;
}

export interface Session {
    id: number;
    date?: string | null;
    duration?: number | null;
    completed?: boolean;
    sessionName?: string | null;
    exercices?: Exercise[];
    createdAt?: string;
    updatedAt?: string;
    performedAt?: string;
}

export interface Program {
    id: number;
    name: string;
    description?: string | null;
    status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'DRAFT';
    createdAt?: string;
    updatedAt?: string;
    fitnessProfileId?: number;
    sessions?: Session[];
    startDate?: string;
}

export interface CreateProgramPayload {
    name: string;
    description?: string | null;
    fitnessProfileId: number;
    startDate?: string;
}

export interface ManualProgramPayload {
    createProgramDto: CreateProgramPayload;
    sessions: Array<{
        name?: string;
        exercises: Array<{
            id: number;
            sets?: number;
            reps?: number;
            weight?: number | null;
        }>;
    }>;
}

export interface AddSessionPayload {
    sessionData: {
        name?: string;
        exercises: Array<{
            id: number;
            sets?: number;
            reps?: number;
            weight?: number | null;
        }>;
    };
}