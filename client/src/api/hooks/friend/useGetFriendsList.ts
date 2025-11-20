import { useQuery } from '@tanstack/react-query';
import { FriendFetchDataService } from '../../services/friendService';
import type { Friend } from '../../../types/friend.type';

export function useFriendsList() {
    return useQuery<Friend[], unknown>({
        queryKey: ['friends'],
        queryFn: () => FriendFetchDataService.getFriendsList(),
    });
}

export default useFriendsList;

