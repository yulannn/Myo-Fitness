import { useMutation, useQueryClient } from '@tanstack/react-query';
import FitnessProfileService from '../../services/fitnessProfileService';
import type { FitnessProfile, UpdateFitnessProfilePayload } from '../../../types/fitness-profile.type';

export function useUpdateFitnessProfile(profileId?: number) {
    const qc = useQueryClient();

    return useMutation<FitnessProfile, unknown, UpdateFitnessProfilePayload>({
        mutationFn: (payload: UpdateFitnessProfilePayload) => FitnessProfileService.updateFitnessProfile(profileId as number, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['fitnessProfiles'] });
            if (profileId) qc.invalidateQueries({ queryKey: ['fitnessProfile', profileId] });
        }
    });
}

export default useUpdateFitnessProfile;

