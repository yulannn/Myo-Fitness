import { useQuery } from '@tanstack/react-query';
import { GroupFetchDataService } from '../../services/groupService';

export function useGroupMembers(groupId: number | undefined) {
    return useQuery<any[], unknown>({
        queryKey: ['groupMembers', groupId],
        queryFn: () => GroupFetchDataService.getGroupMembers(groupId as number),
        enabled: typeof groupId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useGroupMembers;

