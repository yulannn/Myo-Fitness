import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatSocket } from '../../../context/ChatSocketContext';

/**
 * Hook pour écouter les événements de demandes d'ami en temps réel via WebSocket
 */
export function useFriendNotifications() {
  const { socket, isConnected } = useChatSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Écouter les nouvelles demandes d'ami reçues
    const handleFriendRequestReceived = (friendRequest: any) => {
      console.log('👥 Nouvelle demande d\'ami reçue:', friendRequest);

      // Invalider les queries pour rafraîchir les demandes en attente
      queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    };

    // Écouter les demandes acceptées
    const handleFriendRequestAccepted = (acceptedBy: any) => {
      console.log('✅ Demande d\'ami acceptée par:', acceptedBy);

      // Invalider les queries pour rafraîchir la liste d'amis et les conversations
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    // Écouter les demandes refusées
    const handleFriendRequestDeclined = (declinedBy: any) => {
      console.log('❌ Demande d\'ami refusée par:', declinedBy);

      // Invalider les queries pour rafraîchir les demandes
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    };

    // S'abonner aux événements
    socket.on('friend:request-received', handleFriendRequestReceived);
    socket.on('friend:request-accepted', handleFriendRequestAccepted);
    socket.on('friend:request-declined', handleFriendRequestDeclined);

    console.log('👂 Écoute des événements de demandes d\'ami activée');

    // Nettoyer les listeners lors du démontage
    return () => {
      socket.off('friend:request-received', handleFriendRequestReceived);
      socket.off('friend:request-accepted', handleFriendRequestAccepted);
      socket.off('friend:request-declined', handleFriendRequestDeclined);
      console.log('👂 Écoute des événements de demandes d\'ami désactivée');
    };
  }, [socket, isConnected, queryClient]);
}
