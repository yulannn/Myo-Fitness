import { useMutation, useQueryClient } from '@tanstack/react-query';
import gymService from '../../services/gym/gymService';
import type { FindOrCreateGymDto } from '../../../types/gym.type';

export const useFindOrCreateGym = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FindOrCreateGymDto) => gymService.findOrCreate(data),
        onSuccess: () => {
            // Invalider le cache des salles à proximité
            queryClient.invalidateQueries({ queryKey: ['nearby-gyms'] });
        },
    });
};
