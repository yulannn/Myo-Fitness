export interface AuthUser {
    id: number;
    email: string;
    name: string;
    profilePictureUrl?: string | null;
    friendCode?: string | null;
    shareActivities?: boolean;
}

export interface AuthSuccessResponse {
    accessToken: string;
    refreshToken: string; // ✅ Obligatoire en client-side
    user: AuthUser;
}

export interface MeResponse {
    user: AuthUser;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    name: string;
    password: string;
}

export type FieldErrors = Record<string, string>;

export interface ApiErrorPayload {
    status: number;
    message: string;
    fieldErrors?: FieldErrors;
    details?: unknown;
}

export class ApiError extends Error {
    status: number;
    fieldErrors: FieldErrors;
    details?: unknown;

    constructor({ status, message, fieldErrors, details }: ApiErrorPayload) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.fieldErrors = fieldErrors ?? {};
        this.details = details;
    }
}

