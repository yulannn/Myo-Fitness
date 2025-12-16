import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import ChatService from '../../services/chatService';
import { useChatSocket } from '../../../context/ChatSocketContext';

export function useConversations() {
    const queryClient = useQueryClient();
    const { socket, isConnected } = useChatSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Écouter les nouveaux messages pour mettre à jour la liste des conversations
        const handleNewMessage = () => {
            queryClient.refetchQueries({ queryKey: ['conversations'] });
        };

        const handleMessageUpdated = () => {
            queryClient.refetchQueries({ queryKey: ['conversations'] });
        };

        const handleMessageDeleted = () => {
            queryClient.refetchQueries({ queryKey: ['conversations'] });
        };

        socket.on('message:new', handleNewMessage);
        socket.on('message:updated', handleMessageUpdated);
        socket.on('message:deleted', handleMessageDeleted);
        socket.on('friend:request-accepted', handleNewMessage); // Reuse handleNewMessage to refetch conversations

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('message:updated', handleMessageUpdated);
            socket.off('message:deleted', handleMessageDeleted);
            socket.off('friend:request-accepted', handleNewMessage);
        };
    }, [socket, isConnected, queryClient]);

    return useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await ChatService.getConversations();
            return response.data;
        },
        // Configuration pour WebSocket
        staleTime: Infinity, // Les données ne deviennent jamais stale (mises à jour via WebSocket)
        refetchOnWindowFocus: false, // Pas de refetch au focus (WebSocket maintient à jour)
        refetchOnReconnect: false, // Pas de refetch à la reconnexion réseau
        refetchOnMount: false, // Pas de refetch au remontage si données en cache
    });
}

export function useConversation(id: string | null) {
    return useQuery({
        queryKey: ['conversation', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await ChatService.getConversation(id);
            return response.data;
        },
        enabled: !!id,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}
