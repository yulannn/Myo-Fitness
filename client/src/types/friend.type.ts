export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface User {
    id: number;
    name?: string;
    email?: string;
    [key: string]: any;
}

export interface Friend {
    id: number;
    userId: number;
    friendId: number;
    status: FriendStatus;
    createdAt?: string;
    user?: User;
    friend?: User;
}

export interface CreateFriendPayload {
    friendId: number;
    status?: FriendStatus;
}

