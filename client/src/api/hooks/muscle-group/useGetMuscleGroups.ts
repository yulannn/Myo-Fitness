import { useQuery } from '@tanstack/react-query';
import { MuscleGroupService } from '../../services/muscleGroupService';
import type { MuscleGroup } from '../../../types/fitness-profile.type';

export function useMuscleGroups() {
    return useQuery<MuscleGroup[], unknown>({
        queryKey: ['muscle-groups'],
        queryFn: () => MuscleGroupService.getAllMuscleGroups(),
        staleTime: 1000 * 60 * 60 * 24, // 24h - ces données changent rarement
    });
}

export default useMuscleGroups;
