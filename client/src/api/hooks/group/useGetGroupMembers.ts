import { useQuery } from '@tanstack/react-query';
import { GroupFetchDataService } from '../../services/groupService';

export interface GroupMembersData {
    id: number;
    name: string;
    adminId: number | null;
    createdAt: string;
    updatedAt: string;
    admin: {
        id: number;
        name: string;
        email: string;
        profilePictureUrl: string | null;
    } | null;
    members: Array<{
        id: number;
        name: string;
        email: string;
        profilePictureUrl: string | null;
    }>;
}

export function useGroupMembers(groupId: number | undefined) {
    return useQuery<GroupMembersData, unknown>({
        queryKey: ['groupMembers', groupId],
        queryFn: () => GroupFetchDataService.getGroupMembers(groupId as number),
        enabled: typeof groupId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useGroupMembers;

