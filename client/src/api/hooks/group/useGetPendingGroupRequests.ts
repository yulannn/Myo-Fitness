import { useQuery } from '@tanstack/react-query';
import { GroupFetchDataService } from '../../services/groupService';
import type { Group } from '../../../types/group.type';

export function usePendingGroupRequests() {
    return useQuery<Group[], unknown>({
        queryKey: ['groupRequests'],
        queryFn: () => GroupFetchDataService.getPendingGroupRequests(),
    });
}

export default usePendingGroupRequests;

