import { useQuery } from '@tanstack/react-query';
import ChatService from '../../services/chatService';

export function useConversations() {
    return useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await ChatService.getConversations();
            return response.data;
        },
        refetchInterval: 5000, // Refetch toutes les 5s pour les nouveaux messages
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
    });
}
