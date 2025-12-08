import { useMutation } from "@tanstack/react-query";
import SessionService from "../../services/sessionService";
import type { Session } from "../../../types/session.type";
import { useQueryClient } from "@tanstack/react-query";


export default function useUpdateCompletedSession() {
    const qc = useQueryClient();

    return useMutation<Session, unknown, number>({
        mutationFn: (sessionId: number) => SessionService.completedSession(sessionId),
        onSuccess: (_, sessionId) => {
            qc.invalidateQueries({ queryKey: ['program'] });
            qc.invalidateQueries({ queryKey: ['sessions'] });
            qc.invalidateQueries({ queryKey: ['sessions', 'all'] });
            qc.invalidateQueries({ queryKey: ['user', 'xp'] });
            if (sessionId) qc.invalidateQueries({ queryKey: ['session', sessionId] });
        }
    });
}
