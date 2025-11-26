import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProgramService from '../../services/programService';
import type { Program, CreateProgramPayload } from '../../../types/program.type';

export function useCreateProgram() {
  const qc = useQueryClient();

  const mutation = useMutation<Program, unknown, CreateProgramPayload>({
    mutationFn: (payload: CreateProgramPayload) => ProgramService.createProgram(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['program'] });
    },
  });
  return mutation;
}

export default useCreateProgram;


