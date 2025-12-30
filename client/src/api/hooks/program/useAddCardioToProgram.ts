import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../apiClient';

export interface AddCardioToProgramDto {
  exerciseId: number;
  position: 'START' | 'END';
  duration: number;
}

export function useAddCardioToProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ programId, dto }: { programId: number; dto: AddCardioToProgramDto }) => {
      const response = await api.post(`/program/${programId}/cardio`, dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export default useAddCardioToProgram;
