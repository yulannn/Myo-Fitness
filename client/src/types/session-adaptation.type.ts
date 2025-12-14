export interface SessionAdaptation {
    id: number;
    programId: number;
    date?: string;
    duration?: number;
    sessionName?: string | null;
    exercices?: any[];
    [key: string]: any;
}

