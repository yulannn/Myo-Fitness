import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coachingService } from '../../services/coachingService';

export const useAssignSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, sessionData }: { clientId: number; sessionData: any }) =>
      coachingService.assignSession(clientId, sessionData),
    onSuccess: (_, { clientId }) => {
      // Invalider les données du client pour rafraîchir la liste des séances
      queryClient.invalidateQueries({ queryKey: ['coaching', 'client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['coaching', 'clients'] });
    },
  });
};
