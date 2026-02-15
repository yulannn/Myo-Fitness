import { useQuery } from '@tanstack/react-query';
import { coachingService } from '../../services/coachingService';

export const useCoachSessions = () => {
  return useQuery({
    queryKey: ['coaching', 'sessions'],
    queryFn: () => coachingService.getCoachSessions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
