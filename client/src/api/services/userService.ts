import { ApiError } from './authService'

const API_BASE_URL = 'http://localhost:3000'
const USERS_BASE_URL = `${API_BASE_URL}/api/v1/users`

export async function uploadProfilePicture(file: File, accessToken: string): Promise<{ profilePictureUrl: string }> {
  const formData = new FormData()
  formData.append('profilePicture', file)

  try {
    const res = await fetch(`${USERS_BASE_URL}/me/profile-picture`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: formData,
      credentials: 'include',
    })

    const text = await res.text()
    const body = text ? JSON.parse(text) : undefined

    if (!res.ok) {
      throw new ApiError({
        status: res.status,
        message: (body as any)?.message || 'Erreur lors de l\'upload',
        details: body,
      })
    }

    return body as { profilePictureUrl: string }
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError({
      status: 0,
      message: 'Impossible de contacter le serveur',
      details: err,
    })
  }
}
