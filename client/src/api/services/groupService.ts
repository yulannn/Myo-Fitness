import api from '../apiClient';
import type { Group, CreateGroupPayload, SendGroupRequestPayload } from '../../types/group.type';
import type { GroupMembersData } from '../hooks/group/useGetGroupMembers';

export const GroupFetchDataService = {
    async createGroup(payload: CreateGroupPayload): Promise<Group> {
        const res = await api.post<Group>('/group', payload);
        return res.data;
    },

    async sendGroupRequest(groupId: number, payload: SendGroupRequestPayload): Promise<Group> {
        const res = await api.post<Group>(`/group/${groupId}/request`, payload);
        return res.data;
    },

    async acceptGroupRequest(requestId: number): Promise<{ message: string }> {
        const res = await api.patch<{ message: string }>(`/group/request/${requestId}/accept`);
        return res.data;
    },

    async declineGroupRequest(requestId: number): Promise<{ message: string }> {
        const res = await api.patch<{ message: string }>(`/group/request/${requestId}/decline`);
        return res.data;
    },

    async getPendingGroupRequests(): Promise<Group[]> {
        const res = await api.get<Group[]>('/group/requests');
        return res.data;
    },

    async getGroupMembers(groupId: number): Promise<GroupMembersData> {
        const res = await api.get<GroupMembersData>(`/group/groupmembers/${groupId}`);
        return res.data;
    },

    async getUserGroups(): Promise<Group[]> {
        const res = await api.get<Group[]>('/group/mygroups');
        return res.data;
    },

    async updateGroup(groupId: number, name: string): Promise<Group> {
        const res = await api.patch<Group>(`/group/${groupId}`, { name });
        return res.data;
    },

    async removeMember(groupId: number, userId: number): Promise<{ message: string }> {
        const res = await api.delete<{ message: string }>(`/group/${groupId}/members/${userId}`);
        return res.data;
    },

    async deleteGroup(groupId: number): Promise<{ message: string }> {
        const res = await api.delete<{ message: string }>(`/group/${groupId}`);
        return res.data;
    },
};

export default GroupFetchDataService;

