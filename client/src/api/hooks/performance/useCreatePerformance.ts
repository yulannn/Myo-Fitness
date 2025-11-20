import { useMutation, useQueryClient } from '@tanstack/react-query';
import PerformanceService from '../../services/performanceService';
import type { Performance, CreatePerformancePayload } from '../../../types/performance.type';

export function useCreatePerformance() {
  const qc = useQueryClient();

  const mutation = useMutation<Performance, unknown, CreatePerformancePayload>({
    mutationFn: (payload: CreatePerformancePayload) => PerformanceService.createPerformance(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['performances'] });
    },
  });
  return mutation;
}

export default useCreatePerformance;

