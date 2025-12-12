import { useQuery } from '@tanstack/react-query';
import SessionFetchDataService from '../../services/sessionService';

/**
 * Hook pour récupérer les sessions d'un utilisateur
 * @param startDate - Date de début (format ISO, ex: "2024-12-01")
 * @param endDate - Date de fin (format ISO, ex: "2024-12-31")
 * 
 * 🎯 Utilisation :
 * - Sans paramètres : Récupère TOUTES les sessions (utilisé pour stats globales, home, etc.)
 * - Avec paramètres : Récupère seulement les session du mois (utilisé pour le calendrier)
 */
const useGetAllUserSessions = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['sessions', 'all', startDate, endDate],
        queryFn: () => SessionFetchDataService.getAllUserSessions(startDate, endDate),
    });
};

export default useGetAllUserSessions;
