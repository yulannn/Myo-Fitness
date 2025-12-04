import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PerformanceData {
    exerciceSessionId: number;
    setIndex: number;
    reps_effectuees?: number;
    weight?: number;
    rpe?: number;
    success?: boolean;
    // ID de la performance sauvegardée dans la BDD (pour permettre l'update)
    savedPerformanceId?: number;
}

interface PerformanceStore {
    // État
    performances: Record<string, PerformanceData>;
    sessionId: number | null;

    // Actions
    setSessionId: (id: number | null) => void;

    updatePerformance: (
        exerciceSessionId: number,
        setIndex: number,
        data: Partial<PerformanceData>
    ) => void;

    toggleSuccess: (exerciceSessionId: number, setIndex: number) => void;

    markAsSaved: (
        exerciceSessionId: number,
        setIndex: number,
        performanceId: number
    ) => void;

    getPerformance: (exerciceSessionId: number, setIndex: number) => PerformanceData | undefined;

    clearSession: () => void;

    getAllPerformances: () => PerformanceData[];
}

// Helper pour générer la clé unique
const getKey = (exerciceSessionId: number, setIndex: number) =>
    `${exerciceSessionId}-${setIndex}`;

export const usePerformanceStore = create<PerformanceStore>()(
    persist(
        (set, get) => ({
            performances: {},
            sessionId: null,

            setSessionId: (id: number | null) => set({ sessionId: id }),

            updatePerformance: (exerciceSessionId: number, setIndex: number, data: Partial<PerformanceData>) => {
                const key = getKey(exerciceSessionId, setIndex);
                set((state) => ({
                    performances: {
                        ...state.performances,
                        [key]: {
                            ...state.performances[key],
                            exerciceSessionId,
                            setIndex,
                            ...data,
                        },
                    },
                }));
            },

            toggleSuccess: (exerciceSessionId: number, setIndex: number) => {
                const key = getKey(exerciceSessionId, setIndex);
                const current = get().performances[key];
                set((state) => ({
                    performances: {
                        ...state.performances,
                        [key]: {
                            ...current,
                            exerciceSessionId,
                            setIndex,
                            success: !current?.success,
                        },
                    },
                }));
            },

            markAsSaved: (exerciceSessionId: number, setIndex: number, performanceId: number) => {
                const key = getKey(exerciceSessionId, setIndex);
                set((state) => ({
                    performances: {
                        ...state.performances,
                        [key]: {
                            ...state.performances[key],
                            savedPerformanceId: performanceId,
                        },
                    },
                }));
            },

            getPerformance: (exerciceSessionId: number, setIndex: number) => {
                const key = getKey(exerciceSessionId, setIndex);
                return get().performances[key];
            },

            clearSession: () => {
                set({ performances: {}, sessionId: null });
            },

            getAllPerformances: () => {
                return Object.values(get().performances);
            },
        }),
        {
            name: 'performance-storage', // Nom dans localStorage
            // Ne persister que si une session est active
            partialize: (state) =>
                state.sessionId
                    ? { performances: state.performances, sessionId: state.sessionId }
                    : { performances: {}, sessionId: null },
        }
    )
);
