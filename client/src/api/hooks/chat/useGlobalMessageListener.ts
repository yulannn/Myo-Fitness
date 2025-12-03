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

    console.log('🌐 [WebSocket] Listener global de messages activé');

    // Écouter TOUS les messages (peu importe la conversation active)
    const handleNewMessage = (message: any) => {
      console.log('💬 [WebSocket] Nouveau message reçu pour conversation:', message.conversationId);
      console.log('📝 [WebSocket] Message ID:', message.id);
      console.log('👤 [WebSocket] Envoyeur:', message.sender?.name);

      // Stratégie 1: Mettre à jour le cache pour affichage instantané
      queryClient.setQueryData(['messages', message.conversationId], (oldData: any) => {
        console.log('📊 [Cache] État actuel du cache:', oldData ? `${oldData.length} messages` : 'vide');

        if (!oldData) {
          console.log('📝 [Cache] Création du cache avec le nouveau message');
          return [message];
        }

        // Vérifier si le message existe déjà pour éviter les doublons
        if (oldData.some((m: any) => m.id === message.id)) {
          console.log(`⚠️ [Cache] Message ${message.id} déjà présent, skip`);
          return oldData;
        }

        console.log(`➕ [Cache] Ajout du message ${message.id} au cache`);
        return [...oldData, message];
      });

      // Stratégie 2: INVALIDER la query pour forcer un refetch
      // Ceci est CRUCIAL pour que le message s'affiche quand l'utilisateur ouvre la conv
      console.log('🔄 [Query] Invalidation de la query messages pour:', message.conversationId);
      queryClient.invalidateQueries({
        queryKey: ['messages', message.conversationId],
        refetchType: 'all' // Force le refetch même si la query n'est pas montée
      });

      // Aussi invalider les conversations pour mettre à jour le lastMessage
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleMessageUpdated = (message: any) => {
      console.log('✏️ [WebSocket] Message mis à jour:', message.id);

      queryClient.setQueryData(['messages', message.conversationId], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((m: any) => (m.id === message.id ? message : m));
      });

      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
    };

    const handleMessageDeleted = (data: { messageId: string; conversationId?: string }) => {
      console.log('🗑️ [WebSocket] Message supprimé:', data.messageId);

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
      console.log('🌐 [WebSocket] Listener global de messages désactivé');
      socket.off('message:new', handleNewMessage);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
    };
  }, [socket, isConnected, queryClient]);
}
