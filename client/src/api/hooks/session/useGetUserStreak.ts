import { useQuery } from '@tanstack/react-query';
import SessionFetchDataService from '../../services/sessionService';

/**
 * 🔥 Hook optimisé pour récupérer les données de streak
 * Calcul côté backend/DB pour des performances optimales
 */
const useGetUserStreak = () => {
  return useQuery({
    queryKey: ['sessions', 'streak'],
    queryFn: () => SessionFetchDataService.getUserStreak(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default useGetUserStreak;
