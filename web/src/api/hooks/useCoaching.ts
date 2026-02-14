import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CoachingService from '../services/coachingService';
import { Client } from '../../types';

export function useClients() {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: CoachingService.getClients,
  });
}

export function useClientDetail(clientId: number | null) {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => CoachingService.getClientDetail(clientId!),
    enabled: !!clientId,
  });
}

export function useClientSessionDetail(clientId: number | null, sessionId: number | null) {
  return useQuery({
    queryKey: ['clients', clientId, 'sessions', sessionId],
    queryFn: () => CoachingService.getClientSessionDetail(clientId!, sessionId!),
    enabled: !!clientId && !!sessionId,
  });
}

export function useCreateCoachingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uniqueCode: string) => CoachingService.createRequest(uniqueCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
}

export function useTerminateRelationship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (relationshipId: number) => CoachingService.terminateRelationship(relationshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ['pendingRequests'],
    queryFn: CoachingService.getPendingRequests,
  });
}

export function useRespondToRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: string }) =>
      CoachingService.respondToRequest(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['myCoach'] });
    },
  });
}

export function useMyCoach() {
  return useQuery({
    queryKey: ['myCoach'],
    queryFn: CoachingService.getMyCoach,
  });
}
