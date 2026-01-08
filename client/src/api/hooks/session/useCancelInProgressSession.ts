import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SessionFetchDataService } from '../../services/sessionService';

/**
 * Hook pour annuler une session IN_PROGRESS
 * Remet la session en SCHEDULED et supprime les performances
 */
export function useCancelInProgressSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: number) => SessionFetchDataService.cancelInProgressSession(sessionId),
        onSuccess: () => {
            // Immédiatement mettre le cache à null pour éviter que la modal se réouvre
            queryClient.setQueryData(['session', 'in-progress'], null);

            // Ensuite invalider pour forcer un refetch propre
            queryClient.invalidateQueries({ queryKey: ['session'] });
            queryClient.invalidateQueries({ queryKey: ['program'] });
        },
    });
}

export default useCancelInProgressSession;

