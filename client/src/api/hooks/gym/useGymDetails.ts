import { useQuery } from '@tanstack/react-query';
import gymService from '../../services/gym/gymService';

export const useGymDetails = (gymId: number | null) => {
    return useQuery({
        queryKey: ['gym-details', gymId],
        queryFn: () => {
            if (!gymId) throw new Error('Gym ID is required');
            return gymService.getGymDetails(gymId);
        },
        enabled: !!gymId,
        staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    });
};
