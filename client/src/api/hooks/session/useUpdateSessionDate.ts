import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionService from '../../services/sessionService';
import type { Session, UpdateSessionDatePayload } from '../../../types/session.type';

export function useUpdateSessionDate(sessionId?: number) {
    const qc = useQueryClient();

    return useMutation<Session, unknown, UpdateSessionDatePayload>({
        mutationFn: (payload: UpdateSessionDatePayload) => SessionService.updateSessionDate(sessionId as number, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sessions'] });
            if (sessionId) qc.invalidateQueries({ queryKey: ['session', sessionId] });
        }
    });
}

export default useUpdateSessionDate;

