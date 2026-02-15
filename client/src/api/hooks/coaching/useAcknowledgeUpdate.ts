import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coachingService } from '../../services/coachingService';

export default function useAcknowledgeUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionTemplateId: number) =>
            coachingService.acknowledgeSessionUpdate(sessionTemplateId),
        onSuccess: () => {
            // Invalider le programme actif pour mettre à jour l'UI
            queryClient.invalidateQueries({ queryKey: ['program', 'active'] });
        },
    });
}
