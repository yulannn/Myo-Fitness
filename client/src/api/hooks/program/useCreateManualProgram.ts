import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProgramService from '../../services/programService';
import type { Program, ManualProgramPayload } from '../../../types/program.type';

export function useCreateManualProgram() {
  const qc = useQueryClient();

  const mutation = useMutation<Program, unknown, ManualProgramPayload>({
    mutationFn: (payload: ManualProgramPayload) => ProgramService.createManualProgram(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
    }
  });
  return mutation;
}

export default useCreateManualProgram;