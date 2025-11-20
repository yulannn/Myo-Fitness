import { useMutation, useQueryClient } from '@tanstack/react-query';
import FitnessProfileService from '../../services/fitnessProfileService';

export function useDeleteFitnessProfile() {
    const qc = useQueryClient();

    return useMutation<{ message: string }, unknown, number>({
        mutationFn: (profileId: number) => FitnessProfileService.deleteFitnessProfile(profileId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['fitnessProfiles'] });
        }
    });
}

export default useDeleteFitnessProfile;

