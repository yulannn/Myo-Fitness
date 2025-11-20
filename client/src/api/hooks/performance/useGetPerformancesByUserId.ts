import { useQuery } from '@tanstack/react-query';
import { PerformanceFetchDataService } from '../../services/performanceService';
import type { Performance } from '../../../types/performance.type';

export function usePerformancesByUserId(userId: number | undefined) {
    return useQuery<Performance[], unknown>({
        queryKey: ['performances', 'user', userId],
        queryFn: () => PerformanceFetchDataService.getPerformancesByUserId(userId as number),
        enabled: typeof userId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default usePerformancesByUserId;

