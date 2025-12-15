import { useQuery } from '@tanstack/react-query';
import SessionFetchDataService from '../../services/sessionService';

/**
 * 🚀 Hook optimisé pour récupérer les sessions du calendrier
 * Retourne uniquement les données minimales nécessaires pour l'affichage
 * 
 * @param startDate - Date de début (format ISO, ex: "2024-12-01")
 * @param endDate - Date de fin (format ISO, ex: "2024-12-31")
 */
const useGetSessionsForCalendar = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['sessions', 'calendar', startDate, endDate],
        queryFn: () => SessionFetchDataService.getSessionsForCalendar(startDate, endDate),
        enabled: !!startDate && !!endDate, // Ne charge que si les dates sont fournies
    });
};

export default useGetSessionsForCalendar;
