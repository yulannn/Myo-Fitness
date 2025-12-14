import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProgramService from '../../services/programService';
import type { Program, AddSessionPayload } from '../../../types/program.type';

export function useAddSessionToProgram(programId?: number) {
    const qc = useQueryClient();

    return useMutation<Program, unknown, AddSessionPayload>({
        mutationFn: (payload: AddSessionPayload) => ProgramService.addSessionToProgram(programId as number, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['program'] });
            if (programId) qc.invalidateQueries({ queryKey: ['program', programId] });
        }
    });

}

export default useAddSessionToProgram;