export interface User {
    id: number;
    email: string;
    name: string;
    profilePictureUrl?: string | null;
    level?: number;
    xp?: number;
    friendCode?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface UploadProfilePictureResponse {
    profilePictureUrl: string;
}

