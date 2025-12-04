import { useQuery } from '@tanstack/react-query';
import { LevelFetchDataService } from '../../services/levelService';
import type { LevelStats } from '../../../types/level.type';

export function useGetMyStats() {
    return useQuery<LevelStats, unknown>({
        queryKey: ['level', 'stats'],
        queryFn: () => LevelFetchDataService.getMyStats(),
    });
}

export default useGetMyStats;
