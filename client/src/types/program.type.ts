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
    status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'DRAFT';
    createdAt?: string;
    updatedAt?: string;
    fitnessProfileId?: number;
    sessions?: Session[];
    startDate?: string;
}

// 🎯 Type pour les templates d'entraînement (doit correspondre à l'enum Prisma)
export type ProgramTemplate =
    | 'FULL_BODY'        // 1-2j
    | 'UPPER_LOWER'      // 4j
    | 'PUSH_PULL_LEGS'   // 3j
    | 'PPL_UPPER_LOWER'  // 5j
    | 'PPL_X2'           // 6j
    | 'PPL_X2_FULL_BODY' // 7j
    | 'CUSTOM';

export interface CreateProgramPayload {
    name: string;
    fitnessProfileId: number;
    startDate?: string;
    template?: ProgramTemplate; // 🆕 Template optionnel choisi par l'utilisateur
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