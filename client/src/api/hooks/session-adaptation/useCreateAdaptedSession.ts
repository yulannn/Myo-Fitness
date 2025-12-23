import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionAdaptationService from '../../services/sessionAdaptationService';
import type { SessionAdaptation } from '../../../types/session-adaptation.type';

export function useCreateAdaptedSession() {
    const qc = useQueryClient();

    return useMutation<SessionAdaptation, unknown, number>({
        mutationFn: (trainingSessionId: number) => SessionAdaptationService.createAdaptedSession(trainingSessionId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['program'] });
            qc.invalidateQueries({ queryKey: ['sessions'] });
            qc.invalidateQueries({ queryKey: ['sessionAdaptation'] });
        }
    });
}

export default useCreateAdaptedSession;

