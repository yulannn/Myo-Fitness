import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coachingService } from '../../services/coachingService';

export const useSaveCoachSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionData: any) => coachingService.saveCoachSession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching', 'sessions'] });
    },
  });
};
