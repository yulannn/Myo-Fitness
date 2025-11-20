export interface SessionPhoto {
    id: number;
    sessionId: number;
    userId: number;
    photoUrl: string;
    description?: string;
    createdAt?: string;
    session?: any;
    user?: any;
}

export interface CreateSessionPhotoPayload {
    sessionId: number;
    description?: string;
    photo?: File;
}

