import { useQuery } from '@tanstack/react-query';
import { FriendFetchDataService } from '../../services/friendService';
import type { Friend } from '../../../types/friend.type';

export function usePendingFriendRequests() {
    return useQuery<Friend[], unknown>({
        queryKey: ['friendRequests'],
        queryFn: () => FriendFetchDataService.getPendingFriendRequests(),
    });
}

export default usePendingFriendRequests;

