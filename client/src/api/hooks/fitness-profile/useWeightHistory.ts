import { useQuery } from '@tanstack/react-query';
import FitnessProfileFetchDataService from '../../services/fitnessProfileService';

export function useWeightHistory() {
    return useQuery({
        queryKey: ['weightHistory'],
        queryFn: () => FitnessProfileFetchDataService.getWeightHistory(),
    });
}

export default useWeightHistory;
