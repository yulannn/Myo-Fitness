import { useQuery } from '@tanstack/react-query';
import { ProgramFetchDataService } from '../services/programService';

export const useProgramData = () => {

    return useQuery({
        queryKey: ['program'],
        queryFn: () => ProgramFetchDataService.getProgramsById(),
    });
}