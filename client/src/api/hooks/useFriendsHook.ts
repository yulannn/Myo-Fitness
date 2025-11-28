import { useQuery } from '@tanstack/react-query';
import { FriendFetchDataService } from '../services/friendService';

export function useFriends() {
    return useQuery({
        queryKey: ['friends'],
        queryFn: () => FriendFetchDataService.getFriendsList(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}
