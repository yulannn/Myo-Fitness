import { useQuery } from '@tanstack/react-query';
import GroupService from '../services/groupService';

export function useMyGroups() {
    return useQuery({
        queryKey: ['myGroups'],
        queryFn: () => GroupService.getUserGroups(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
}
