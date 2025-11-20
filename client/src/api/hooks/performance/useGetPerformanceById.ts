import { useQuery } from '@tanstack/react-query';
import PerformanceService from '../../services/performanceService';
import type { Performance } from '../../../types/performance.type';

export function usePerformanceById(performanceId: number | undefined) {
    return useQuery<Performance, unknown>({
        queryKey: ['performance', performanceId],
        queryFn: () => PerformanceService.getPerformanceById(performanceId as number),
        enabled: typeof performanceId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default usePerformanceById;

