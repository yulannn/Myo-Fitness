import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface ChatSocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const ChatSocketContext = createContext<ChatSocketContextType>({
    socket: null,
    isConnected: false,
});

export const useChatSocket = () => useContext(ChatSocketContext);

export const ChatSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Ne connecter que si l'utilisateur est authentifié
        if (!user?.id) {
            // Déconnecter si l'utilisateur se déconnecte
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Éviter de créer plusieurs connexions
        if (socketRef.current?.connected) {
            return;
        }

        // Créer la connexion Socket.io
        const SOCKET_URL = 'http://localhost:3000';
        const newSocket = io(`${SOCKET_URL}/chat`, {
            auth: {
                userId: user.id,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Événements de connexion
        newSocket.on('connect', () => {
            console.log('✅ WebSocket chat connecté');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ WebSocket chat déconnecté');
            setIsConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('❌ Erreur WebSocket:', error);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Cleanup lors du démontage
        return () => {
            if (socketRef.current) {
                console.log('🔌 Déconnexion WebSocket chat');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user?.id]);

    return (
        <ChatSocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </ChatSocketContext.Provider>
    );
};
