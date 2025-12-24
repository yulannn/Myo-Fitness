import { useQuery } from '@tanstack/react-query';
import SessionFetchDataService from '../../services/sessionService';

/**
 * 🏆 Hook optimisé pour récupérer les records personnels
 * Calcul côté backend/DB pour des performances optimales
 */
const useGetPersonalRecords = (limit = 3) => {
  return useQuery({
    queryKey: ['sessions', 'records', limit],
    queryFn: () => SessionFetchDataService.getPersonalRecords(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default useGetPersonalRecords;
