export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type Goal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'ENDURANCE' | 'MAINTENANCE'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type ProgramTemplate =
  | 'FULL_BODY'
  | 'PUSH_PULL_LEGS'
  | 'UPPER_LOWER'
  | 'UPPER_LOWER_UPPER_LOWER'
  | 'UPPER_LOWER_PUSH_PULL'
  | 'PUSH_PULL_LEGS_UPPER_LOWER'
  | 'PUSH_PULL_LEGS_PUSH_PULL_LEGS'
  | 'PUSH_PULL_LEGS_CARDIO'
  | 'CUSTOM'

export interface WeightEntry {
  date: string
  weight: number
}

export interface SessionSetPerformance {
  id: number
  exerciceName: string
  sessionName: string
  date: string
  repsCompleted: number
  repsTarget: number
  weight?: number
  rpe?: number
  success: boolean
}

export interface SessionExercise {
  id: number
  name: string
  sets: number
  reps: number
  weight?: number
  muscleGroups: string[]
  equipment: string[]
  difficulty: number
  tempo?: string
  sessionName?: string
}

export interface TrainingSession {
  id: number
  name: string
  focus: string
  sessionName?: string
  scheduledDate?: string
  durationMinutes?: number
  exercices: SessionExercise[]
}

export interface TrainingProgram {
  id: number
  name: string
  description?: string
  template: ProgramTemplate
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'DRAFT'
  createdAt: string
  lastUpdated: string
  sessions: TrainingSession[]
}

export interface FitnessProfile {
  id: number
  nickname: string
  userId: number
  age: number
  height: number
  currentWeight: number
  trainingFrequency: number
  experienceLevel: ExperienceLevel
  goals: Goal[]
  gender: Gender
  bodyWeight: boolean
  weightHistory: WeightEntry[]
  activeProgramId?: number
}

export interface Exercise {
  id: number
  name: string
  type: 'COMPOUND' | 'ISOLATION' | 'CARDIO' | 'MOBILITY' | 'STRETCH'
  difficulty: number
  description: string
  isDefault: boolean
  imageUrl?: string
  muscleGroups: string[]
  equipment: string[]
  bodyWeight: boolean
  materials: boolean
  tips: string[]
}

export interface EquipmentItem {
  id: number
  name: string
  description?: string
  category: string
  imageUrl?: string
}

export interface FriendRequest {
  id: string
  from: string
  mutualWorkouts: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  message?: string
  sentAt: string
}

export interface Friend {
  id: number
  name: string
  goal: Goal
  streak: number
  avatarUrl: string
  lastWorkout: string
}

export interface User {
  id: number
  name: string
  email: string
  avatarUrl: string
  joinedAt: string
  streak: number
  totalWorkouts: number
  totalVolume: number
  currentGoal: Goal
  fitnessProfiles: FitnessProfile[]
}

export interface AiRecommendation {
  id: string
  title: string
  summary: string
  actions: string[]
  focusArea: string
}

