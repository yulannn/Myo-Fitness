import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionService from '../../services/sessionService';
import type { Session, AddExerciseToSessionPayload } from '../../../types/session.type';

export function useUpdateExerciseInSession(sessionId?: number, exerciceId?: number) {
    const qc = useQueryClient();

    return useMutation<Session, unknown, AddExerciseToSessionPayload>({
        mutationFn: (payload: AddExerciseToSessionPayload) => SessionService.updateExerciseInSession(sessionId as number, exerciceId as number, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sessions'] });
            if (sessionId) qc.invalidateQueries({ queryKey: ['session', sessionId] });
        }
    });
}

export default useUpdateExerciseInSession;

