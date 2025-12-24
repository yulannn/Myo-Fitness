import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionService from '../../services/sessionService';

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number>({
    mutationFn: async (sessionId: number) => {
      await SessionService.deleteSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });

      // 🚀 NOUVEAUX: Invalider les stats après suppression
      queryClient.invalidateQueries({ queryKey: ['sessions', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'records'] }); // Potentiellement affecté
      queryClient.invalidateQueries({ queryKey: ['sessions', 'streak'] }); // Potentiellement affecté
    },
  });
}

export default useDeleteSession;
