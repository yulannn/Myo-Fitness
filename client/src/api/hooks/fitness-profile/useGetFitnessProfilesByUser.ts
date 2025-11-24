import { useQuery } from '@tanstack/react-query';
import { FitnessProfileFetchDataService } from '../../services/fitnessProfileService';
import type { FitnessProfile } from '../../../types/fitness-profile.type';

export function useFitnessProfilesByUser() {
    return useQuery<FitnessProfile, unknown>({
        queryKey: ['fitnessProfiles'],
        queryFn: () => FitnessProfileFetchDataService.getFitnessProfilesByUser(),
    });
}

export default useFitnessProfilesByUser;

