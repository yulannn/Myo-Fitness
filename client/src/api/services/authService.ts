export interface SignUpPayload {
  email: string
  name: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  id: number
  email: string
  name: string
  profilePictureUrl: string
  [key: string]: unknown
}

export interface AuthSuccessResponse {
  accessToken: string
  refreshToken?: string
  user: AuthUser
}

export interface MeResponse {
  user: AuthUser
}

export type FieldErrors = Record<string, string>

export interface ApiErrorPayload {
  status: number
  message: string
  fieldErrors?: FieldErrors
  details?: unknown
}

export class ApiError extends Error {
  status: number
  fieldErrors: FieldErrors
  details?: unknown

  constructor({ status, message, fieldErrors, details }: ApiErrorPayload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors ?? {}
    this.details = details
  }
}

const API_BASE_URL = 'http://localhost:3000'
const AUTH_BASE_URL = `${API_BASE_URL}/api/v1/auth`

const KNOWN_FIELDS = new Set(['email', 'password', 'name', 'firstName', 'lastName'])

function normaliseFieldErrors(messages: unknown): FieldErrors {
  const result: FieldErrors = {}

  if (!messages) {
    return result
  }

  const list = Array.isArray(messages) ? messages : [messages]

  for (const entry of list) {
    if (typeof entry !== 'string') {
      continue
    }

    const [firstWord, ...rest] = entry.split(' ')
    const potentialField = firstWord?.replace(/[^a-zA-Z]/g, '')

    if (potentialField && KNOWN_FIELDS.has(potentialField)) {
      result[potentialField] = rest.join(' ').trim() || entry
    } else {
      result.general = result.general ? `${result.general} ${entry}` : entry
    }
  }

  return result
}

function buildApiError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object') {
    const payload = body as Partial<{ message: unknown; error?: string } & Record<string, unknown>>
    const message =
      (Array.isArray(payload.message) ? payload.message.join(' ') : String(payload.message ?? payload.error ?? 'Erreur inconnue')) || 'Erreur inconnue'

    return new ApiError({
      status,
      message,
      fieldErrors: normaliseFieldErrors(payload.message),
      details: body,
    })
  }

  return new ApiError({
    status,
    message: 'Une erreur inconnue est survenue',
    details: body,
  })
}

async function parseJsonSafe<T>(response: Response): Promise<T | undefined> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text) as T
  } catch (error) {
    console.warn('Failed to parse JSON response', error)
    return undefined
  }
}

async function fetchJson<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const headers = new Headers(init.headers ?? {})
  headers.set('Accept', 'application/json')

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  try {
    const response = await fetch(`${AUTH_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    })

    const body = await parseJsonSafe<T | Record<string, unknown>>(response)

    if (!response.ok) {
      throw buildApiError(response.status, body)
    }

    if (body === undefined || body === null) {
      if (response.status === 204) return undefined as T
      throw new ApiError({
        status: response.status,
        message: 'Réponse inattendue du serveur',
        details: { status: response.status, url: response.url },
      })
    }

    return body as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError({
      status: 0,
      message: 'Impossible de contacter le serveur. Vérifie ta connexion.',
      details: error,
    })
  }
}

export async function register(payload: SignUpPayload): Promise<AuthSuccessResponse> {
  return fetchJson<AuthSuccessResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload: LoginPayload): Promise<AuthSuccessResponse> {
  return fetchJson<AuthSuccessResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getCurrentUser(accessToken: string): Promise<MeResponse> {
  return fetchJson<MeResponse>('/me', undefined, accessToken)
}

export async function logout(accessToken: string): Promise<void> {
  await fetchJson<{ message: string }>('/logout', { method: 'POST' }, accessToken)
}
