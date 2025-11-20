import { useQuery } from '@tanstack/react-query';
import { SessionPhotoFetchDataService } from '../../services/sessionPhotoService';
import type { SessionPhoto } from '../../../types/session-photo.type';

export function useTodaySessionPhotos() {
    return useQuery<SessionPhoto[], unknown>({
        queryKey: ['sessionPhotos', 'today'],
        queryFn: () => SessionPhotoFetchDataService.getTodaySessionPhotos(),
    });
}

export default useTodaySessionPhotos;

