import { useQuery } from '@tanstack/react-query';
import ChatService from '../../services/chatService';

export function useMessages(conversationId: string | null) {
    return useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const response = await ChatService.getMessages(conversationId);
            return response.data;
        },
        enabled: !!conversationId,
        refetchInterval: 3000, // Polling toutes les 3s (sera remplacé par WebSocket)
    });
}
