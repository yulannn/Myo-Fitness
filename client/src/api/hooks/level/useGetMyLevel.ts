import { useQuery } from '@tanstack/react-query';
import { LevelFetchDataService } from '../../services/levelService';
import type { Level } from '../../../types/level.type';

export function useGetMyLevel() {
    return useQuery<Level, unknown>({
        queryKey: ['level', 'me'],
        queryFn: () => LevelFetchDataService.getMyLevel(),
    });
}

export default useGetMyLevel;
