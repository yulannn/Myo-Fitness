import { useMutation, useQueryClient } from '@tanstack/react-query';
import ChatService, { type SendMessageDto } from '../../services/chatService';

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: SendMessageDto) => ChatService.sendMessage(dto),
        onSuccess: (_, variables) => {
            // Invalider les messages de cette conversation
            queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
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
