import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { uploadProfilePicture } from '../services/userService'

export function useUploadProfilePicture() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => {
      if (!accessToken) throw new Error('Missing access token')
      return uploadProfilePicture(file, accessToken)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}