export interface Performance {
    id_set: number;
    exerciceSessionId: number;
    reps_effectuees?: number;
    reps_prevues?: number;
    weight?: number;
    rpe?: number;
}

export interface CreatePerformancePayload {
    exerciceSessionId: number;
    reps_effectuees?: number;
    weight?: number;
    rpe?: number;
}

export interface UpdatePerformancePayload {
    exerciceSessionId?: number;
    reps_effectuees?: number;
    weight?: number;
    rpe?: number;
}

