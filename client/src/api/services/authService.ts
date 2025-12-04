import api from '../apiClient';
import axios, { type AxiosResponse } from 'axios';
import type { AuthSuccessResponse, MeResponse, LoginPayload, RegisterPayload } from '../../types/auth.type';
import { ApiError } from '../../types/auth.type';

const KNOWN_FIELDS = new Set(['email', 'password', 'name', 'firstName', 'lastName']);

function normaliseFieldErrors(messages: unknown): Record<string, string> {
    const result: Record<string, string> = {};

    if (!messages) {
        return result;
    }

    const list = Array.isArray(messages) ? messages : [messages];

    for (const entry of list) {
        if (typeof entry !== 'string') {
            continue;
        }

        const [firstWord, ...rest] = entry.split(' ');
        const potentialField = firstWord?.replace(/[^a-zA-Z]/g, '');

        if (potentialField && KNOWN_FIELDS.has(potentialField)) {
            result[potentialField] = rest.join(' ').trim() || entry;
        } else {
            result.general = result.general ? `${result.general} ${entry}` : entry;
        }
    }

    return result;
}

function buildApiError(status: number, body: unknown): ApiError {
    if (body && typeof body === 'object') {
        const payload = body as Partial<{ message: unknown; error?: string } & Record<string, unknown>>;
        const message =
            (Array.isArray(payload.message) ? payload.message.join(' ') : String(payload.message ?? payload.error ?? 'Erreur inconnue')) || 'Erreur inconnue';

        return new ApiError({
            status,
            message,
            fieldErrors: normaliseFieldErrors(payload.message),
            details: body,
        });
    }

    return new ApiError({
        status,
        message: 'Une erreur inconnue est survenue',
        details: body,
    });
}

async function requestApi<T>(call: Promise<AxiosResponse<T>>): Promise<T> {
    try {
        const res = await call;
        return res.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status ?? 0;
            const body = err.response?.data ?? err.message;
            throw buildApiError(status, body);
        }
        throw buildApiError(0, err);
    }
}

export const AuthFetchDataService = {
    async login(payload: LoginPayload): Promise<AuthSuccessResponse> {
        return requestApi<AuthSuccessResponse>(api.post('/auth/login', payload));
    },

    async register(payload: RegisterPayload): Promise<AuthSuccessResponse> {
        return requestApi<AuthSuccessResponse>(api.post('/auth/register', payload));
    },

    async getCurrentUser(accessToken: string): Promise<MeResponse> {
        return requestApi<MeResponse>(
            api.get('/auth/me', {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            }),
        );
    },

    async logout(accessToken: string): Promise<{ message: string }> {
        return requestApi<{ message: string }>(
            api.post('/auth/logout', undefined, {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            }),
        );
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
        return requestApi<{ message: string }>(
            api.post('/auth/forgot-password', { email }),
        );
    },

    async verifyCode(email: string, code: string): Promise<{ valid: boolean }> {
        return requestApi<{ valid: boolean }>(
            api.post('/auth/verify-code', { email, code }),
        );
    },

    async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
        return requestApi<{ message: string }>(
            api.post('/auth/reset-password', { email, code, newPassword }),
        );
    },
};

export default AuthFetchDataService;

