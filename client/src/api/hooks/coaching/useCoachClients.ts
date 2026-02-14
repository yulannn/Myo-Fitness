import { useQuery } from '@tanstack/react-query';
import { coachingService, type CoachClient } from '../../services/coachingService';

export const useCoachClients = () => {
  return useQuery<CoachClient[]>({
    queryKey: ['coaching', 'clients'],
    queryFn: () => coachingService.getCoachClients(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
