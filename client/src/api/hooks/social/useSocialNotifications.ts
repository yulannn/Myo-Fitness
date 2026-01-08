import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import FriendService from '../../services/friendService';
import GroupService from '../../services/groupService';
import { useConversations } from '../chat/useConversations';
import { useChatSocket } from '../../../context/ChatSocketContext';

export function useSocialNotifications() {
    const queryClient = useQueryClient();
    const { socket } = useChatSocket();

    useEffect(() => {
        if (!socket) return;

        const handleFriendRequest = () => {
            queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
        };

        const handleGroupRequest = () => {
            queryClient.invalidateQueries({ queryKey: ['groupRequests'] });
        };

        socket.on('friend:request-received', handleFriendRequest);
        socket.on('group:request-received', handleGroupRequest);

        return () => {
            socket.off('friend:request-received', handleFriendRequest);
            socket.off('group:request-received', handleGroupRequest);
        };
    }, [socket, queryClient]);

    const { data: friendRequests = [] } = useQuery({
        queryKey: ['friendRequests'],
        queryFn: () => FriendService.getPendingFriendRequests(),
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
    });

    const { data: groupRequests = [] } = useQuery({
        queryKey: ['groupRequests'],
        queryFn: () => GroupService.getPendingGroupRequests(),
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
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
