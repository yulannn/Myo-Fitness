import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionService from '../../services/sessionService';
import type { Session } from '../../../types/session.type';

export function useDeleteExerciseFromSession(sessionId?: number) {
    const qc = useQueryClient();

    return useMutation<Session, unknown, number>({
        mutationFn: (exerciceId: number) => SessionService.deleteExerciseFromSession(sessionId as number, exerciceId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sessions'] });
            if (sessionId) qc.invalidateQueries({ queryKey: ['session', sessionId] });
        }
    });
}

export default useDeleteExerciseFromSession;

