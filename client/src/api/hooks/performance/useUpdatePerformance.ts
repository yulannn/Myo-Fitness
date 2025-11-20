import { useMutation, useQueryClient } from '@tanstack/react-query';
import PerformanceService from '../../services/performanceService';
import type { Performance, UpdatePerformancePayload } from '../../../types/performance.type';

export function useUpdatePerformance(performanceId?: number) {
    const qc = useQueryClient();

    return useMutation<Performance, unknown, UpdatePerformancePayload>({
        mutationFn: (payload: UpdatePerformancePayload) => PerformanceService.updatePerformance(performanceId as number, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['performances'] });
            if (performanceId) qc.invalidateQueries({ queryKey: ['performance', performanceId] });
        }
    });
}

export default useUpdatePerformance;

