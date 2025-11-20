export interface SessionAdaptation {
    id: number;
    programId: number;
    date?: string;
    duration?: number;
    notes?: string | null;
    exercices?: any[];
    [key: string]: any;
}

