import { useEffect } from 'react';
import { useChatSocket } from '../../../context/ChatSocketContext';

/**
 * Hook pour gérer automatiquement la connexion/déconnexion à une conversation via WebSocket
 */
export function useConversationRoom(conversationId: string | null) {
    const { socket, isConnected } = useChatSocket();

    useEffect(() => {
        if (!socket || !isConnected || !conversationId) return;

        // Rejoindre la room de la conversation
        socket.emit('conversation:join', { conversationId }, (response: any) => {
            if (response?.success) {
                console.log(`✅ Joined conversation room: ${conversationId}`);
            }
        });

        // Quitter la room lors du démontage
        return () => {
            socket.emit('conversation:leave', { conversationId }, (response: any) => {
                if (response?.success) {
                    console.log(`👋 Left conversation room: ${conversationId}`);
                }
            });
        };
    }, [socket, isConnected, conversationId]);
}
