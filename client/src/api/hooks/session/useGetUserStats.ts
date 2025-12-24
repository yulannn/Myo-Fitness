import { useQuery } from '@tanstack/react-query';
import SessionFetchDataService from '../../services/sessionService';

/**
 * 📊 Hook optimisé pour récupérer les statistiques utilisateur
 * Calcul côté backend/DB pour des performances optimales
 */
const useGetUserStats = () => {
  return useQuery({
    queryKey: ['sessions', 'stats'],
    queryFn: () => SessionFetchDataService.getUserStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes (stats changent rarement)
  });
};

export default useGetUserStats;
