import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coachingService } from '../../services/coachingService';

export function useCreateCoachingRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uniqueCode: string) => {
      const response = await coachingService.requestCoaching(uniqueCode);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching', 'clients'] });
    },
  });
}
