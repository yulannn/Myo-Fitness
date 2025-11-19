import { useQuery } from '@tanstack/react-query';
import { ProgramFetchDataService } from '../../services/programService';
import type { Program } from '../../../types/program.type';

export function useProgramsByUser() {

    return useQuery<Program[], unknown>({
        queryKey: ['program'],
        queryFn: () => ProgramFetchDataService.getProgramsByUser(),
    });
}