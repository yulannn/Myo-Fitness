import { useQuery } from '@tanstack/react-query';
import { SessionPhotoFetchDataService } from '../../services/sessionPhotoService';
import type { SessionPhoto } from '../../../types/session-photo.type';

export function useSessionPhotosByDay(date: string | undefined) {
    return useQuery<SessionPhoto[], unknown>({
        queryKey: ['sessionPhotos', 'day', date],
        queryFn: () => SessionPhotoFetchDataService.getSessionPhotosByDay(date as string),
        enabled: typeof date === 'string' && date.length > 0,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useSessionPhotosByDay;

