import { useQuery } from '@tanstack/react-query';
import ProgramService from '../../services/programService';
import type { Program } from '../../../types/program.type';

export function useProgramById(programId: number | undefined) {

    return useQuery<Program, unknown>({
        queryKey: ['program', programId],
        queryFn: () => ProgramService.getProgramById(programId as number),
        enabled: typeof programId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}


export default useProgramById;