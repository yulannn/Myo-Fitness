import { useMutation, useQueryClient } from '@tanstack/react-query';
import FitnessProfileService from '../../services/fitnessProfileService';
import type { FitnessProfile, UpdateFitnessProfilePayload } from '../../../types/fitness-profile.type';

interface UpdatePayload extends UpdateFitnessProfilePayload {
    id: number;
}

export function useUpdateFitnessProfile() {
    const qc = useQueryClient();

    return useMutation<FitnessProfile, unknown, UpdatePayload>({
        mutationFn: ({ id, ...payload }: UpdatePayload) =>
            FitnessProfileService.updateFitnessProfile(id, payload),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['fitnessProfiles'] });
            qc.invalidateQueries({ queryKey: ['fitnessProfile', id] });
        }
    });
}

export default useUpdateFitnessProfile;

