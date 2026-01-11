import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BodyAtlasData, UserMuscleStats } from '../types/body-atlas.type';

interface BodyAtlasStore {
    // État
    atlasData: BodyAtlasData | null;
    isLoading: boolean;
    error: string | null;
    lastFetchTime: number | null;

    // Actions
    setAtlasData: (data: BodyAtlasData) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearAtlas: () => void;

    // Helpers
    getMuscleStats: (muscleGroupId: number) => UserMuscleStats | undefined;
    shouldRefetch: () => boolean;
}

export const useBodyAtlasStore = create<BodyAtlasStore>()(
    persist(
        (set, get) => ({
            // État initial
            atlasData: null,
            isLoading: false,
            error: null,
            lastFetchTime: null,

            // Actions
            setAtlasData: (data: BodyAtlasData) =>
                set({
                    atlasData: data,
                    lastFetchTime: Date.now(),
                    error: null,
                }),

            setLoading: (loading: boolean) => set({ isLoading: loading }),

            setError: (error: string | null) => set({ error, isLoading: false }),

            clearAtlas: () =>
                set({
                    atlasData: null,
                    isLoading: false,
                    error: null,
                    lastFetchTime: null,
                }),

            // Helpers
            getMuscleStats: (muscleGroupId: number) => {
                const { atlasData } = get();
                if (!atlasData) return undefined;

                return atlasData.muscleStats.find((stat) => stat.muscleGroupId === muscleGroupId);
            },

            shouldRefetch: () => {
                const { lastFetchTime } = get();
                if (!lastFetchTime) return true;

                // Refetch si dernière récupération > 5 minutes
                const FIVE_MINUTES = 5 * 60 * 1000;
                return Date.now() - lastFetchTime > FIVE_MINUTES;
            },
        }),
        {
            name: 'body-atlas-storage',
            // Persister tout sauf le loading state
            partialize: (state) => ({
                atlasData: state.atlasData,
                lastFetchTime: state.lastFetchTime,
            }),
        },
    ),
);
