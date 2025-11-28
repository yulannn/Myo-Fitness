import { useMutation, useQueryClient } from '@tanstack/react-query';
import ChatService, { type SendMessageDto } from '../../services/chatService';
import { useChatSocket } from '../../../context/ChatSocketContext';
import { useAuth } from '../../../context/AuthContext';

export function useSendMessage() {
    const queryClient = useQueryClient();
    const { socket, isConnected } = useChatSocket();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (dto: SendMessageDto) => {
            // Utiliser WebSocket si disponible, sinon HTTP
            if (socket && isConnected && user?.id) {
                return new Promise<any>((resolve, reject) => {
                    socket.emit('message:send', { dto, userId: user.id }, (response: any) => {
                        if (response?.success) {
                            resolve(response.message);
                        } else {
                            // Fallback sur HTTP en cas d'erreur WebSocket
                            ChatService.sendMessage(dto)
                                .then((res) => resolve(res.data))
                                .catch(reject);
                        }
                    });
                });
            } else {
                // Fallback sur HTTP si pas de WebSocket
                const response = await ChatService.sendMessage(dto);
                return response.data;
            }
        },
        onSuccess: () => {
            // Pas besoin d'invalider car WebSocket met à jour automatiquement
            // Mais on invalide quand même les conversations pour le unreadCount
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: string) => ChatService.markAsRead(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}
