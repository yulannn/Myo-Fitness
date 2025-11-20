import { useQuery } from '@tanstack/react-query';
import FitnessProfileService from '../../services/fitnessProfileService';
import type { FitnessProfile } from '../../../types/fitness-profile.type';

export function useFitnessProfileById(profileId: number | undefined) {
    return useQuery<FitnessProfile, unknown>({
        queryKey: ['fitnessProfile', profileId],
        queryFn: () => FitnessProfileService.getFitnessProfileById(profileId as number),
        enabled: typeof profileId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useFitnessProfileById;

