import { useQuery } from '@tanstack/react-query';
import { SessionFetchDataService } from '../../services/sessionService';

/**
 * Hook pour récupérer la session IN_PROGRESS de l'utilisateur
 * Permet de détecter si une session a été abandonnée et peut être reprise
 */
export function useGetInProgressSession() {
    return useQuery({
        queryKey: ['session', 'in-progress'],
        queryFn: () => SessionFetchDataService.getInProgressSession(),
        staleTime: 0, // Toujours considérer comme stale pour respecter les invalidations
        refetchOnMount: 'always', // Toujours refetch au montage de la page
    });
}

export default useGetInProgressSession;

