import { useQuery } from '@tanstack/react-query';
import { FriendFetchDataService } from '../../services/friendService';
import type { Friend } from '../../../types/friend.type';

export function useSentFriendRequests() {
    return useQuery<Friend[], unknown>({
        queryKey: ['sentFriendRequests'],
        queryFn: () => FriendFetchDataService.getSentFriendRequests(),
    });
}

export default useSentFriendRequests;
