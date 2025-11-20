import { useQuery } from '@tanstack/react-query';
import { SessionPhotoFetchDataService } from '../../services/sessionPhotoService';
import type { SessionPhoto } from '../../../types/session-photo.type';

export function useTodaySessionPhotosFromFriends() {
    return useQuery<SessionPhoto[], unknown>({
        queryKey: ['sessionPhotos', 'today', 'friends'],
        queryFn: () => SessionPhotoFetchDataService.getTodaySessionPhotosFromFriends(),
    });
}

export default useTodaySessionPhotosFromFriends;

