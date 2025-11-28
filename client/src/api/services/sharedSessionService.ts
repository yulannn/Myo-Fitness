import api from '../apiClient';

export interface CreateSharedSessionDto {
    title: string;
    description?: string;
    startTime: string;
    location?: string;
    maxParticipants?: number;
    groupId?: number;
}

export interface SharedSession {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    location?: string;
    maxParticipants?: number;
    organizerId: number;
    groupId?: number;
    createdAt: string;
    updatedAt: string;
    organizer: {
        id: number;
        name: string;
        profilePictureUrl?: string;
    };
    participants: {
        id: string;
        userId: number;
        joinedAt: string;
        user: {
            id: number;
            name: string;
            profilePictureUrl?: string;
        };
    }[];
    group?: {
        id: number;
        name: string;
    };
}

class SharedSessionService {
    async create(data: CreateSharedSessionDto) {
        return api.post<SharedSession>('/shared-sessions', data);
    }

    async findAll() {
        return api.get<SharedSession[]>('/shared-sessions');
    }

    async join(id: string) {
        return api.post<any>(`/shared-sessions/${id}/join`);
    }

    async leave(id: string) {
        return api.post<any>(`/shared-sessions/${id}/leave`);
    }

    async delete(id: string) {
        return api.delete<any>(`/shared-sessions/${id}`);
    }

    async inviteGroup(sessionId: string, groupId: number) {
        return api.post<SharedSession>(`/shared-sessions/${sessionId}/invite-group`, { groupId });
    }

    async inviteFriend(sessionId: string, friendId: number) {
        return api.post<any>(`/shared-sessions/${sessionId}/invite-friend`, { friendId });
    }
}

export default new SharedSessionService();
