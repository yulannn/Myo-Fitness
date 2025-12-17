import { useQuery } from '@tanstack/react-query';
import FriendService from '../../services/friendService';

export function useSearchUsers(searchQuery: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['users', searchQuery],
        queryFn: () => FriendService.searchUsers(searchQuery),
        enabled: options?.enabled !== false && searchQuery.length >= 2,
        staleTime: 30 * 1000, // 30 secondes
        refetchOnWindowFocus: false,
    });
}

export default useSearchUsers;
