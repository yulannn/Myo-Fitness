import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProgramService from '../../services/programService';
import type { Program } from '../../../types/program.type';

export function useDeleteSessionFromProgram(programId?: number) {
    const qc = useQueryClient();

    const mutation = useMutation<Program, unknown, number>({
        mutationFn: (sessionId: number) => ProgramService.deleteSessionFromProgram(sessionId),
        onSuccess: async () => {

            await qc.invalidateQueries({ queryKey: ['programs'] })
            if (programId) {
                await qc.invalidateQueries({ queryKey: ['program', programId] })
            }


        },
    })
    return mutation;
}

export default useDeleteSessionFromProgram;