import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionAdaptationService from '../../services/sessionAdaptationService';
import type { SessionAdaptation } from '../../../types/session-adaptation.type';

export function useCreateNewSimilarSession() {
    const qc = useQueryClient();

    return useMutation<SessionAdaptation, unknown, number>({
        mutationFn: (trainingSessionId: number) => SessionAdaptationService.createNewSimilarSession(trainingSessionId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['program', 'active'] }); // ✅ Rafraîchir programme actif
            qc.invalidateQueries({ queryKey: ['program'] }); // ✅ Tous les programmes
            qc.invalidateQueries({ queryKey: ['sessions'] });
            qc.invalidateQueries({ queryKey: ['sessionAdaptation'] });
        }
    });
}

export default useCreateNewSimilarSession;

