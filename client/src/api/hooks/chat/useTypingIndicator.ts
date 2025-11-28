import { useEffect, useState } from 'react';
import { useChatSocket } from '../../../context/ChatSocketContext';
import { useAuth } from '../../../context/AuthContext';

interface TypingState {
    conversationId: string;
    userId: number;
    userName: string;
}

export function useTypingIndicator(conversationId: string | null) {
    const { socket, isConnected } = useChatSocket();
    const { user } = useAuth();
    const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        if (!socket || !isConnected || !conversationId) return;

        const handleUserTyping = (data: TypingState) => {
            if (data.conversationId === conversationId && data.userId !== user?.id) {
                setTypingUsers((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(data.userId, data.userName);
                    return newMap;
                });
            }
        };

        const handleUserStoppedTyping = (data: { conversationId: string; userId: number }) => {
            if (data.conversationId === conversationId) {
                setTypingUsers((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(data.userId);
                    return newMap;
                });
            }
        };

        socket.on('user:typing', handleUserTyping);
        socket.on('user:stopped-typing', handleUserStoppedTyping);

        return () => {
            socket.off('user:typing', handleUserTyping);
            socket.off('user:stopped-typing', handleUserStoppedTyping);
        };
    }, [socket, isConnected, conversationId, user?.id]);

    const startTyping = () => {
        if (socket && isConnected && conversationId && user) {
            socket.emit('typing:start', {
                conversationId,
                userId: user.id,
                userName: user.name,
            });
        }
    };

    const stopTyping = () => {
        if (socket && isConnected && conversationId && user) {
            socket.emit('typing:stop', {
                conversationId,
                userId: user.id,
            });
        }
    };

    return {
        typingUsers: Array.from(typingUsers.values()),
        startTyping,
        stopTyping,
    };
}
