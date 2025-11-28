import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import ChatService from '../../services/chatService';
import { useChatSocket } from '../../../context/ChatSocketContext';

export function useMessages(conversationId: string | null) {
    const queryClient = useQueryClient();
    const { socket, isConnected } = useChatSocket();

    useEffect(() => {
        if (!socket || !isConnected || !conversationId) return;

        // Écouter les événements WebSocket pour les messages
        const handleNewMessage = (message: any) => {
            // Mise à jour optimiste : ajouter le message directement au cache
            if (message.conversationId === conversationId) {
                queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
                    if (!oldData) return [message];
                    // Vérifier si le message existe déjà pour éviter les doublons
                    if (oldData.some((m: any) => m.id === message.id)) return oldData;
                    return [...oldData, message];
                });
            }
        };

        const handleMessageUpdated = (message: any) => {
            if (message.conversationId === conversationId) {
                queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
                    if (!oldData) return oldData;
                    return oldData.map((m: any) => (m.id === message.id ? message : m));
                });
            }
        };

        const handleMessageDeleted = (data: { messageId: string }) => {
            queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.filter((m: any) => m.id !== data.messageId);
            });
        };

        socket.on('message:new', handleNewMessage);
        socket.on('message:updated', handleMessageUpdated);
        socket.on('message:deleted', handleMessageDeleted);

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('message:updated', handleMessageUpdated);
            socket.off('message:deleted', handleMessageDeleted);
        };
    }, [socket, isConnected, conversationId, queryClient]);

    return useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const response = await ChatService.getMessages(conversationId);
            return response.data;
        },
        enabled: !!conversationId,
        // Configuration pour WebSocket
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}
