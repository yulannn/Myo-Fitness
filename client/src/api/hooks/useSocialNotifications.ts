import { useQuery } from '@tanstack/react-query';
import FriendService from '../services/friendService';
import GroupService from '../services/groupService';
import { useConversations } from './chat/useConversations';

export function useSocialNotifications() {
    const { data: friendRequests = [] } = useQuery({
        queryKey: ['friendRequests'],
        queryFn: () => FriendService.getPendingFriendRequests(),
        refetchInterval: 10000, // Polling toutes les 10s pour être réactif
        staleTime: 5000
    });

    const { data: groupRequests = [] } = useQuery({
        queryKey: ['groupRequests'],
        queryFn: () => GroupService.getPendingGroupRequests(),
        refetchInterval: 10000,
        staleTime: 5000
    });

    // useConversations a déjà son propre polling ou invalidation
    const { data: conversations = [] } = useConversations();

    const unreadMessages = conversations.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);

    const totalNotifications = friendRequests.length + groupRequests.length + unreadMessages;

    return {
        totalNotifications,
        friendRequestsCount: friendRequests.length,
        groupRequestsCount: groupRequests.length,
        unreadMessagesCount: unreadMessages
    };
}
