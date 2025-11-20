import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionPhotoService from '../../services/sessionPhotoService';
import type { SessionPhoto, CreateSessionPhotoPayload } from '../../../types/session-photo.type';

export function useUploadSessionPhoto() {
  const qc = useQueryClient();

  const mutation = useMutation<SessionPhoto, unknown, CreateSessionPhotoPayload>({
    mutationFn: (payload: CreateSessionPhotoPayload) => SessionPhotoService.uploadSessionPhoto(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['sessionPhotos'] });
    },
  });
  return mutation;
}

export default useUploadSessionPhoto;

