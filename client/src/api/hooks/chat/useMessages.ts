import { useQuery } from '@tanstack/react-query';
import ChatService from '../../services/chatService';

/**
 * Hook pour récupérer les messages d'une conversation
 * Note: Les événements WebSocket sont gérés globalement par useGlobalMessageListener
 * qui invalide automatiquement cette query quand un nouveau message arrive
 */
export function useMessages(conversationId: string | null) {
    return useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const response = await ChatService.getMessages(conversationId);
            return response.data;
        },
        enabled: !!conversationId,
        // La query sera automatiquement refetch quand elle est invalidée par useGlobalMessageListener
        staleTime: 0, // Les données sont immédiatement stale
        gcTime: 5 * 60 * 1000, // Garde en cache pendant 5 minutes
    });
}
