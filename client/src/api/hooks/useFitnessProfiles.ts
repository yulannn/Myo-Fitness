import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { createFitnessProfile, deleteFitnessProfile, getFitnessProfiles } from '../services/fitnessProfileService';
import type { FitnessProfile, FitnessProfilePayload } from '../services/fitnessProfileService'

export function useFitnessProfiles() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<FitnessProfile[]>({
    queryKey: ['fitnessProfiles'],
    queryFn: () => {
      if (!accessToken) throw new Error('Missing access token');
      return getFitnessProfiles(accessToken);
    },
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: (payload: FitnessProfilePayload) => {
      if (!accessToken) throw new Error('Missing access token');
      return createFitnessProfile(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitnessProfiles'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!accessToken) throw new Error('Missing access token');
      return deleteFitnessProfile(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitnessProfiles'] });
    },
  });

  return { ...query, createMutation , deleteMutation};

  
}
