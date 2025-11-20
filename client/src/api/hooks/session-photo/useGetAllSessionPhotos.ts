import { useQuery } from '@tanstack/react-query';
import { SessionPhotoFetchDataService } from '../../services/sessionPhotoService';
import type { SessionPhoto } from '../../../types/session-photo.type';

export function useAllSessionPhotos() {
    return useQuery<SessionPhoto[], unknown>({
        queryKey: ['sessionPhotos'],
        queryFn: () => SessionPhotoFetchDataService.getAllSessionPhotos(),
    });
}

export default useAllSessionPhotos;

