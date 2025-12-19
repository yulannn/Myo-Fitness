import api from '../apiClient';
import type { MuscleGroup } from '../../types/fitness-profile.type';

export const MuscleGroupService = {
    async getAllMuscleGroups(): Promise<MuscleGroup[]> {
        const res = await api.get<MuscleGroup[]>('/muscle-groups');
        return res.data;
    },
};

export default MuscleGroupService;
