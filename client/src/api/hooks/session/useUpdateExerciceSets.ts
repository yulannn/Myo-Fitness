import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionService from '../../services/sessionService';
import { usePerformanceStore } from '../../../stores/usePerformanceStore';

export function useUpdateExerciceSets() {
    const queryClient = useQueryClient();
    const { activeSession, setActiveSession } = usePerformanceStore();

    return useMutation({
        mutationFn: ({ exerciceSessionId, sets }: { exerciceSessionId: number; sets: number }) =>
            SessionService.updateExerciceSets(exerciceSessionId, sets),
        onSuccess: (_updatedExercice: any, variables: { exerciceSessionId: number; sets: number }) => {
            // Mettre à jour activeSession localement
            if (activeSession) {
                const updatedExercices = activeSession.exercices?.map((ex: any) =>
                    ex.id === variables.exerciceSessionId
                        ? { ...ex, sets: variables.sets }
                        : ex
                );
                setActiveSession({
                    ...activeSession,
                    exercices: updatedExercices
                });
            }

            // Invalider les queries pour rafraîchir
            queryClient.invalidateQueries({ queryKey: ['session', activeSession?.id] });
        },
        onError: (error: any) => {
            console.error('Erreur lors de la mise à jour des séries:', error);
            alert(error?.response?.data?.message || 'Impossible de modifier le nombre de séries');
        }
    });
}

export default useUpdateExerciceSets;
