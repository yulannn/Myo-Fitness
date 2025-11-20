export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type Goal = 'MUSCLE_GAIN' | 'FAT_LOSS' | 'WEIGHT_LOSS' | 'ENDURANCE' | 'FLEXIBILITY' | 'STRENGTH';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface FitnessProfile {
    id: number;
    userId: number;
    age: number;
    height: number;
    weight: number;
    trainingFrequency: number;
    experienceLevel: ExperienceLevel;
    goals: Goal[];
    gender: Gender;
    bodyWeight: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateFitnessProfilePayload {
    age: number;
    height: number;
    weight: number;
    trainingFrequency: number;
    experienceLevel: ExperienceLevel;
    goals: Goal[];
    gender: Gender;
    bodyWeight: boolean;
}

export interface UpdateFitnessProfilePayload {
    age?: number;
    height?: number;
    weight?: number;
    trainingFrequency?: number;
    experienceLevel?: ExperienceLevel;
    goals?: Goal[];
    gender?: Gender;
    bodyWeight?: boolean;
}

