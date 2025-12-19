import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExperienceLevel, Gender, Goal, WeekDay, TrainingEnvironment } from '../types/fitness-profile.type';

export interface OnboardingData {
    // Step 1: Informations de base
    age?: number;
    gender?: Gender;
    height?: number;
    weight?: number;
    city?: string | null;

    // Step 2: Objectif de poids (nouveau)
    targetWeight?: number;

    // Step 3: Objectifs
    goals?: Goal[];

    // Step 4: Expérience
    experienceLevel?: ExperienceLevel;

    // Step 5: Fréquence & Environnement
    trainingFrequency?: number;
    bodyWeight?: boolean;
    trainingEnvironment?: TrainingEnvironment;

    // Step 6: Priorités musculaires (IDs des MuscleGroup)
    musclePriorities?: number[];

    // Step 7: Jours d'entraînement
    trainingDays?: WeekDay[];
}

interface OnboardingStore {
    // État
    currentStep: number;
    data: OnboardingData;
    isCompleted: boolean;

    // Actions
    setCurrentStep: (step: number) => void;
    updateData: (partialData: Partial<OnboardingData>) => void;
    nextStep: () => void;
    previousStep: () => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
}

const TOTAL_STEPS = 9; // Welcome + 8 steps

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set) => ({
            currentStep: 0,
            data: {},
            isCompleted: false,

            setCurrentStep: (step) => set({ currentStep: step }),

            updateData: (partialData) =>
                set((state) => ({
                    data: { ...state.data, ...partialData },
                })),

            nextStep: () =>
                set((state) => ({
                    currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS - 1),
                })),

            previousStep: () =>
                set((state) => ({
                    currentStep: Math.max(state.currentStep - 1, 0),
                })),

            completeOnboarding: () =>
                set({
                    isCompleted: true,
                    currentStep: 0,
                }),

            resetOnboarding: () =>
                set({
                    currentStep: 0,
                    data: {},
                    isCompleted: false,
                }),
        }),
        {
            name: 'myo-onboarding-storage',
            partialize: (state) => ({
                currentStep: state.currentStep,
                data: state.data,
                isCompleted: state.isCompleted,
            }),
        }
    )
);
