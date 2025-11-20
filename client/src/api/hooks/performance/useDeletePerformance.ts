import { useMutation, useQueryClient } from '@tanstack/react-query';
import PerformanceService from '../../services/performanceService';

export function useDeletePerformance() {
    const qc = useQueryClient();

    return useMutation<{ message: string }, unknown, number>({
        mutationFn: (performanceId: number) => PerformanceService.deletePerformance(performanceId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['performances'] });
        }
    });
}

export default useDeletePerformance;

