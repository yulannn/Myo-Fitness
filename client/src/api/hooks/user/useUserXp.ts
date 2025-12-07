import { useQuery } from '@tanstack/react-query';
import apiClient from '../../apiClient';

interface XpData {
    level: number;
    totalXp: number;
    currentLevelXp: number;
    xpForNextLevel: number;
}

/**
 * Hook pour récupérer le niveau et l'XP de l'utilisateur connecté
 */
export const useUserXp = () => {
    return useQuery<XpData>({
        queryKey: ['user', 'xp'],
        queryFn: async () => {
            const { data } = await apiClient.get<XpData>('/users/me/xp');
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
};
