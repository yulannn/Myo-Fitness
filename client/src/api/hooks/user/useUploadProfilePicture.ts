import { useMutation, useQueryClient } from '@tanstack/react-query';
import UserService from '../../services/userService';
import type { UploadProfilePictureResponse } from '../../../types/user.type';

export function useUploadProfilePicture() {
  const qc = useQueryClient();

  const mutation = useMutation<UploadProfilePictureResponse, unknown, File>({
    mutationFn: (file: File) => UserService.uploadProfilePicture(file),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
  return mutation;
}

export default useUploadProfilePicture;

