export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type Goal = 'MUSCLE_GAIN' | 'FAT_LOSS' | 'WEIGHT_LOSS' | 'ENDURANCE' | 'FLEXIBILITY' | 'STRENGTH';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type WeekDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' | 'CUSTOM';
export type MuscleCategory = 'CHEST' | 'BACK' | 'SHOULDERS' | 'ARMS' | 'LEGS' | 'CORE' | 'OTHER';
export type TrainingEnvironment = 'HOME' | 'GYM';

export interface FitnessProfile {
    id: number;
    userId: number;
    age: number;
    height: number;
    weight: number;
    city: string | null;
    trainingFrequency: number;
    experienceLevel: ExperienceLevel;
    goals: Goal[];
    gender: Gender;
    bodyWeight: boolean;
    trainingDays?: WeekDay[];
    targetWeight?: number | null;
    musclePriorities: MuscleCategory[];
    trainingEnvironment: TrainingEnvironment;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateFitnessProfilePayload {
    age: number;
    height: number;
    weight: number;
    city: string | null;
    trainingFrequency: number;
    experienceLevel: ExperienceLevel;
    goals: Goal[];
    gender: Gender;
    bodyWeight: boolean;
    trainingDays?: WeekDay[];
    targetWeight?: number;
    musclePriorities?: MuscleCategory[];
    trainingEnvironment?: TrainingEnvironment;
}

export interface UpdateFitnessProfilePayload {
    age?: number;
    height?: number;
    weight?: number;
    city?: string | null;
    trainingFrequency?: number;
    experienceLevel?: ExperienceLevel;
    goals?: Goal[];
    gender?: Gender;
    bodyWeight?: boolean;
    trainingDays?: WeekDay[];
    targetWeight?: number;
    musclePriorities?: MuscleCategory[];
    trainingEnvironment?: TrainingEnvironment;
}

