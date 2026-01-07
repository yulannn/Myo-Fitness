import { useQuery } from '@tanstack/react-query';
import api from '../../apiClient';
import { LeaderboardType } from '../../../types/leaderboard.type';
import type { LeaderboardResponse, LeaderboardTypeInfo } from '../../../types/leaderboard.type';

/**
 * Hook pour récupérer le leaderboard des amis par type
 */
export const useFriendsLeaderboard = (type: LeaderboardType) => {
    return useQuery<LeaderboardResponse>({
        queryKey: ['leaderboard', 'friends', type],
        queryFn: async () => {
            const { data } = await api.get(`/leaderboard/friends`, {
                params: { type },
            });
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes - données relativement stables
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
};

/**
 * Hook pour récupérer les types de leaderboard disponibles
 */
export const useLeaderboardTypes = () => {
    return useQuery<LeaderboardTypeInfo[]>({
        queryKey: ['leaderboard', 'types'],
        queryFn: async () => {
            const { data } = await api.get(`/leaderboard/types`);
            return data;
        },
        staleTime: Infinity, // Les types ne changent jamais
    });
};
