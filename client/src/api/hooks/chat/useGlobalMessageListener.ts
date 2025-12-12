import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatSocket } from '../../../context/ChatSocketContext';

/**
 * Hook global pour écouter tous les événements de messages
 * Doit être utilisé au niveau de l'application pour garantir
 * que tous les messages sont capturés même si l'utilisateur
 * n'est pas dans la conversation
 */
export function useGlobalMessageListener() {
  const { socket, isConnected } = useChatSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: any) => {
      queryClient.setQueryData(['messages', message.conversationId], (oldData: any) => {
        if (!oldData) {
          return [message];
        }

        if (oldData.some((m: any) => m.id === message.id)) {
          return oldData;
        }

        return [...oldData, message];
      });

      queryClient.invalidateQueries({
        queryKey: ['messages', message.conversationId],
        refetchType: 'all'
      });

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleMessageUpdated = (message: any) => {
      queryClient.setQueryData(['messages', message.conversationId], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((m: any) => (m.id === message.id ? message : m));
      });

      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
    };

    const handleMessageDeleted = (data: { messageId: string; conversationId?: string }) => {
      if (data.conversationId) {
        queryClient.setQueryData(['messages', data.conversationId], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((m: any) => m.id !== data.messageId);
        });

        queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
    };
  }, [socket, isConnected, queryClient]);
}
