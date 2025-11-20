import { useMutation, useQueryClient } from '@tanstack/react-query';
import FitnessProfileService from '../../services/fitnessProfileService';
import type { FitnessProfile, CreateFitnessProfilePayload } from '../../../types/fitness-profile.type';

export function useCreateFitnessProfile() {
  const qc = useQueryClient();

  const mutation = useMutation<FitnessProfile, unknown, CreateFitnessProfilePayload>({
    mutationFn: (payload: CreateFitnessProfilePayload) => FitnessProfileService.createFitnessProfile(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['fitnessProfiles'] });
    },
  });
  return mutation;
}

export default useCreateFitnessProfile;

