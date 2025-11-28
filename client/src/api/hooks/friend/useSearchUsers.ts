import { useQuery } from '@tanstack/react-query';
import FriendService from '../../services/friendService';

export function useSearchUsers(searchQuery: string) {
    return useQuery({
        queryKey: ['users', searchQuery],
        queryFn: () => FriendService.searchUsers(searchQuery),
        enabled: searchQuery.length >= 2,
        staleTime: 30 * 1000, // 30 secondes
        refetchOnWindowFocus: false,
    });
}

export default useSearchUsers;
