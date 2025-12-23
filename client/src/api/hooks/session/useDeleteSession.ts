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
    },
  });
}

export default useDeleteSession;
