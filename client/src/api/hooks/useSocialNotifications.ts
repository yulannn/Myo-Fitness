import { useQuery } from '@tanstack/react-query';
import FriendService from '../services/friendService';
import GroupService from '../services/groupService';
import { useConversations } from './chat/useConversations';

export function useSocialNotifications() {
    const { data: friendRequests = [] } = useQuery({
        queryKey: ['friendRequests'],
        queryFn: () => FriendService.getPendingFriendRequests(),
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { data: groupRequests = [] } = useQuery({
        queryKey: ['groupRequests'],
        queryFn: () => GroupService.getPendingGroupRequests(),
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

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
