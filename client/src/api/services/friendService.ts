import api from '../apiClient';
import type { Friend, CreateFriendPayload } from '../../types/friend.type';

export const FriendFetchDataService = {
    async sendFriendRequest(payload: CreateFriendPayload): Promise<Friend> {
        const res = await api.post<Friend>('/friend', payload);
        return res.data;
    },

    async acceptFriendRequest(requestId: number): Promise<{ message: string }> {
        const res = await api.patch<{ message: string }>(`/friend/${requestId}/accept`);
        return res.data;
    },

    async declineFriendRequest(requestId: number): Promise<{ message: string }> {
        const res = await api.patch<{ message: string }>(`/friend/${requestId}/decline`);
        return res.data;
    },

    async getPendingFriendRequests(): Promise<Friend[]> {
        const res = await api.get<Friend[]>('/friend');
        return res.data;
    },

    async getFriendsList(): Promise<Friend[]> {
        const res = await api.get<Friend[]>('/friend/friendlist');
        return res.data;
    },
};

export default FriendFetchDataService;

