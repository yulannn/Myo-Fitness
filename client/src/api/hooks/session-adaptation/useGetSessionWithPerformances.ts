import { useQuery } from '@tanstack/react-query';
import { SessionAdaptationFetchDataService } from '../../services/sessionAdaptationService';
import type { SessionAdaptation } from '../../../types/session-adaptation.type';

export function useSessionWithPerformances(trainingSessionId: number | undefined) {
    return useQuery<SessionAdaptation, unknown>({
        queryKey: ['sessionAdaptation', trainingSessionId],
        queryFn: () => SessionAdaptationFetchDataService.getSessionWithPerformances(trainingSessionId as number),
        enabled: typeof trainingSessionId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useSessionWithPerformances;

