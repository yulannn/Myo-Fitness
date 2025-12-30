import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../apiClient';

export function useRemoveCardioFromProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: number) => {
      const response = await api.delete(`/program/${programId}/cardio`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export default useRemoveCardioFromProgram;
