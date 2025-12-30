export interface MuscleGroup {
    id: number;
    name: string;
}

export interface ExerciceMuscleGroup {
    exerciceId: number;
    groupeId: number;
    isPrimary: boolean;
    groupe: MuscleGroup;
}

export interface Exercice {
    id: number;
    name: string;
    difficulty: number;
    description?: string | null;
    type?: string | null;
    imageUrl?: string | null;
    Materials: boolean;
    bodyWeight: boolean;
    isDefault: boolean;
    createdByUserId?: number | null;
    createdAt?: string;
    updatedAt?: string;
    groupes?: ExerciceMuscleGroup[];
}

export interface ExerciceMinimal {
    id: number;
    name: string;
    type?: string | null; // 🆕 Pour détecter les exercices cardio
    groupes?: { isPrimary: boolean; groupe: MuscleGroup }[];
}

export interface CreateExercicePayload {
    name: string;
    difficulty: number;
    description?: string;
    bodyWeight: boolean;
    Materials?: boolean;
    muscleGroupIds?: number[];
    equipmentIds?: number[];
}

export interface UpdateExercicePayload {
    name?: string;
    difficulty?: number;
    description?: string;
    bodyWeight?: boolean;
    Materials?: boolean;
    muscleGroupIds?: number[];
    equipmentIds?: number[];
}

