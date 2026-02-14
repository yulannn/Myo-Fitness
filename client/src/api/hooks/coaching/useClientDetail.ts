import { useQuery } from '@tanstack/react-query';
import { coachingService } from '../../services/coachingService';

export const useClientDetail = (clientId: number) => {
  return useQuery({
    queryKey: ['coaching', 'client', clientId],
    queryFn: () => coachingService.getClientDetail(clientId),
    enabled: Boolean(clientId),
  });
};

export const useClientSessions = (clientId: number) => {
  return useQuery({
    queryKey: ['coaching', 'client', clientId, 'sessions'],
    queryFn: () => coachingService.getClientSessions(clientId),
    enabled: Boolean(clientId),
  });
};

export const useClientSessionDetail = (clientId: number, sessionId: number) => {
  return useQuery({
    queryKey: ['coaching', 'client', clientId, 'session', sessionId],
    queryFn: () => coachingService.getClientSessionDetail(clientId, sessionId),
    enabled: Boolean(clientId) && Boolean(sessionId),
  });
};
