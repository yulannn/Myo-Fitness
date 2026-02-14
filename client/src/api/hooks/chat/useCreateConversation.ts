import { useMutation, useQueryClient } from '@tanstack/react-query';
import ChatService, { type CreateConversationDto } from '../../services/chatService';

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateConversationDto) => {
      const response = await ChatService.createConversation(dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
