import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SharedSessionService, { type CreateSharedSessionDto } from '../../services/sharedSessionService';
import { useChatSocket } from '../../../context/ChatSocketContext';
import { useEffect } from 'react';

export function useSharedSessions() {
    const queryClient = useQueryClient();
    const { socket } = useChatSocket();

    // Écouter les événements WebSocket pour mettre à jour la liste
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        };

        // Événements reçus du backend
        socket.on('session:invitation', handleUpdate);
        socket.on('session:user-joined', handleUpdate);
        socket.on('session:user-left', handleUpdate);
        socket.on('session:deleted', handleUpdate);

        return () => {
            socket.off('session:invitation', handleUpdate);
            socket.off('session:user-joined', handleUpdate);
            socket.off('session:user-left', handleUpdate);
            socket.off('session:deleted', handleUpdate);
        };
    }, [socket, queryClient]);

    return useQuery({
        queryKey: ['sharedSessions'],
        queryFn: async () => {
            const response = await SharedSessionService.findAll();
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes (mis à jour via WS ou mutations)
        refetchOnWindowFocus: false,
    });
}

export function useCreateSharedSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSharedSessionDto) => SharedSessionService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        },
    });
}

export function useJoinSharedSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => SharedSessionService.join(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        },
    });
}

export function useLeaveSharedSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => SharedSessionService.leave(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        },
    });
}

export function useDeleteSharedSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => SharedSessionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        },
    });
}

export function useInviteGroupToSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, groupId }: { sessionId: string; groupId: number }) =>
            SharedSessionService.inviteGroup(sessionId, groupId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        },
    });
}

export function useInviteFriendToSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, friendId }: { sessionId: string; friendId: number }) =>
            SharedSessionService.inviteFriend(sessionId, friendId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        },
    });
}
