import { useEffect } from 'react';
import { useChatSocket } from '../../context/ChatSocketContext';
import { useQueryClient } from '@tanstack/react-query';

export function useSessionNotifications() {
    const { socket } = useChatSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket) return;

        // Écouter les invitations
        const handleInvitation = (data: any) => {
            console.log('📅 [SESSION] Nouvelle invitation reçue:', data);

            // Invalider les queries pour mettre à jour la liste
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });

            // Afficher une notification (peut être amélioré avec une bibliothèque de toasts)
            if (Notification.permission === 'granted') {
                new Notification('Nouvelle séance planifiée !', {
                    body: `${data.session.organizer.name} a créé "${data.session.title}"`,
                    icon: '/logo.png',
                });
            } else {
                console.log('⚠️ Permissions de notification non accordées');
            }
        };

        // Écouter quand quelqu'un rejoint
        const handleUserJoined = (data: any) => {
            console.log('✅ [SESSION] Utilisateur a rejoint:', data);
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        };

        // Écouter quand quelqu'un quitte
        const handleUserLeft = (data: any) => {
            console.log('❌ [SESSION] Utilisateur a quitté:', data);
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        };

        // Écouter les suppressions
        const handleSessionDeleted = (data: any) => {
            console.log('🗑️ [SESSION] Séance supprimée:', data);
            queryClient.invalidateQueries({ queryKey: ['sharedSessions'] });
        };

        socket.on('session:invitation', handleInvitation);
        socket.on('session:user-joined', handleUserJoined);
        socket.on('session:user-left', handleUserLeft);
        socket.on('session:deleted', handleSessionDeleted);

        return () => {
            socket.off('session:invitation', handleInvitation);
            socket.off('session:user-joined', handleUserJoined);
            socket.off('session:user-left', handleUserLeft);
            socket.off('session:deleted', handleSessionDeleted);
        };
    }, [socket, queryClient]);
}
