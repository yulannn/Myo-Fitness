import { useQuery } from '@tanstack/react-query';
import { GroupFetchDataService } from '../../services/groupService';
import type { Group } from '../../../types/group.type';

export function useUserGroups() {
    return useQuery<Group[], unknown>({
        queryKey: ['groups'],
        queryFn: () => GroupFetchDataService.getUserGroups(),
    });
}

export default useUserGroups;

