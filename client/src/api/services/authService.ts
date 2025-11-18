import api from "../apiClient";
import axios, { type AxiosResponse } from "axios";

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


async function requestApi<T>(call: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const res = await call
    return res.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 0
      const body = err.response?.data ?? err.message
      throw buildApiError(status, body)
    }
    throw buildApiError(0, err)
  }
}

export async function register(payload: SignUpPayload): Promise<AuthSuccessResponse> {
  return requestApi<AuthSuccessResponse>(api.post("/auth/register", payload))
}

export async function login(payload: LoginPayload): Promise<AuthSuccessResponse> {
  return requestApi<AuthSuccessResponse>(api.post("/auth/login", payload))
}

export async function getCurrentUser(accessToken: string): Promise<MeResponse> {
  return requestApi<MeResponse>(
    api.get("/auth/me", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    }),
  )
}

export async function logout(accessToken: string): Promise<void> {
  await requestApi<{ message: string }>(
    api.post("/auth/logout", undefined, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    }),
  )
}
