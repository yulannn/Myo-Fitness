import { useQuery } from '@tanstack/react-query';
import SessionPhotoService from '../../services/sessionPhotoService';
import type { SessionPhoto } from '../../../types/session-photo.type';

export function useSessionPhotoById(photoId: number | undefined) {
    return useQuery<SessionPhoto, unknown>({
        queryKey: ['sessionPhoto', photoId],
        queryFn: () => SessionPhotoService.getSessionPhotoById(photoId as number),
        enabled: typeof photoId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useSessionPhotoById;

