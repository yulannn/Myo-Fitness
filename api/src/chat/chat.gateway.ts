import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

// Map pour stocker les connexions utilisateur -> socket
const userSockets = new Map<number, Set<string>>();

@WebSocketGateway({
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        // Récupérer l'ID utilisateur depuis le handshake auth
        const userId = client.handshake.auth?.userId;
        if (userId) {
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId)?.add(client.id);
            console.log(`User ${userId} connected with socket ${client.id}`);
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);

        const userId = client.handshake.auth?.userId;
        if (userId) {
            userSockets.get(userId)?.delete(client.id);
            if (userSockets.get(userId)?.size === 0) {
                userSockets.delete(userId);
            }
        }
    }

    // ========== EVENTS ==========

    @SubscribeMessage('message:send')
    async handleSendMessage(
        @MessageBody() data: { dto: SendMessageDto; userId: number },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const message = await this.chatService.sendMessage(data.dto, data.userId);

            // Ré envoyer le message à tous les participants de la conversation
            const conversation = await this.chatService.getConversation(
                data.dto.conversationId,
                data.userId,
            );

            conversation.participants.forEach((participant) => {
                const socketIds = userSockets.get(participant.userId);
                if (socketIds) {
                    socketIds.forEach((socketId) => {
                        this.server.to(socketId).emit('message:new', message);
                    });
                }
            });

            return { success: true, message };
        } catch (error) {
            client.emit('error', { message: error.message });
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('message:edit')
    async handleEditMessage(
        @MessageBody()
        data: { messageId: string; dto: UpdateMessageDto; userId: number },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const message = await this.chatService.updateMessage(
                data.messageId,
                data.dto,
                data.userId,
            );

            // Notifier tous les participants
            const messageWithConv = await this.chatService.getMessages(
                message.conversationId,
                data.userId,
                0,
                1,
            );

            if (messageWithConv.length > 0) {
                const conversation = await this.chatService.getConversation(
                    message.conversationId,
                    data.userId,
                );

                conversation.participants.forEach((participant) => {
                    const socketIds = userSockets.get(participant.userId);
                    if (socketIds) {
                        socketIds.forEach((socketId) => {
                            this.server.to(socketId).emit('message:updated', message);
                        });
                    }
                });
            }

            return { success: true, message };
        } catch (error) {
            client.emit('error', { message: error.message });
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('message:delete')
    async handleDeleteMessage(
        @MessageBody() data: { messageId: string; userId: number },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const message = await this.chatService.deleteMessage(
                data.messageId,
                data.userId,
            );

            // Notifier tous les participants
            const conversation = await this.chatService.getConversation(
                message.conversationId,
                data.userId,
            );

            conversation.participants.forEach((participant) => {
                const socketIds = userSockets.get(participant.userId);
                if (socketIds) {
                    socketIds.forEach((socketId) => {
                        this.server.to(socketId).emit('message:deleted', {
                            messageId: data.messageId,
                        });
                    });
                }
            });

            return { success: true };
        } catch (error) {
            client.emit('error', { message: error.message });
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('typing:start')
    async handleTypingStart(
        @MessageBody() data: { conversationId: string; userId: number; userName: string },
    ) {
        const conversation = await this.chatService.getConversation(
            data.conversationId,
            data.userId,
        );

        conversation.participants.forEach((participant) => {
            if (participant.userId !== data.userId) {
                const socketIds = userSockets.get(participant.userId);
                if (socketIds) {
                    socketIds.forEach((socketId) => {
                        this.server.to(socketId).emit('user:typing', {
                            conversationId: data.conversationId,
                            userId: data.userId,
                            userName: data.userName,
                        });
                    });
                }
            }
        });
    }

    @SubscribeMessage('typing:stop')
    async handleTypingStop(
        @MessageBody() data: { conversationId: string; userId: number },
    ) {
        const conversation = await this.chatService.getConversation(
            data.conversationId,
            data.userId,
        );

        conversation.participants.forEach((participant) => {
            if (participant.userId !== data.userId) {
                const socketIds = userSockets.get(participant.userId);
                if (socketIds) {
                    socketIds.forEach((socketId) => {
                        this.server.to(socketId).emit('user:stopped-typing', {
                            conversationId: data.conversationId,
                            userId: data.userId,
                        });
                    });
                }
            }
        });
    }

    // Helper pour joindre une room de conversation
    @SubscribeMessage('conversation:join')
    handleJoinConversation(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(`conversation:${data.conversationId}`);
        return { success: true };
    }

    @SubscribeMessage('conversation:leave')
    handleLeaveConversation(
        @MessageBody() data: { conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(`conversation:${data.conversationId}`);
        return { success: true };
    }

    // ========== SHARED SESSIONS EVENTS ==========

    /**
     * Notifier les membres d'un groupe ou des amis spécifiques qu'une séance a été créée
     */
    notifySessionCreated(session: any, memberIds: number[]) {
        console.log(`📧 Envoi d'invitations à ${memberIds.length} membres:`, memberIds);
        memberIds.forEach((memberId) => {
            const socketIds = userSockets.get(memberId);
            console.log(`  - Utilisateur ${memberId}: ${socketIds ? socketIds.size + ' connexions' : 'NON CONNECTÉ'}`);
            if (socketIds) {
                socketIds.forEach((socketId) => {
                    this.server.to(socketId).emit('session:invitation', {
                        type: 'created',
                        session,
                    });
                    console.log(`    ✓ Notification envoyée au socket ${socketId}`);
                });
            }
        });
    }

    /**
     * Notifier un nouveau message dans une conversation (utilisé par d'autres services)
     */
    async notifyNewMessage(message: any, conversationId: string) {
        console.log(`💬 Envoi du message dans la conversation ${conversationId}`);

        // Récupérer tous les participants de la conversation
        const conversation = await this.chatService.getConversation(conversationId, message.senderId);

        // Envoyer le message à tous les participants (incluant l'expéditeur)
        conversation.participants.forEach((participant) => {
            const socketIds = userSockets.get(participant.userId);
            if (socketIds) {
                socketIds.forEach((socketId) => {
                    this.server.to(socketId).emit('message:new', message);
                    console.log(`    ✓ Message envoyé au socket ${socketId} (user ${participant.userId})`);
                });
            }
        });
    }


    /**
     * Notifier quand quelqu'un rejoint une séance
     */
    notifySessionJoined(sessionId: string, userId: number, userName: string, participantIds: number[]) {
        participantIds.forEach((participantId) => {
            const socketIds = userSockets.get(participantId);
            if (socketIds) {
                socketIds.forEach((socketId) => {
                    this.server.to(socketId).emit('session:user-joined', {
                        sessionId,
                        userId,
                        userName,
                    });
                });
            }
        });
    }

    /**
     * Notifier quand quelqu'un quitte une séance
     */
    notifySessionLeft(sessionId: string, userId: number, userName: string, participantIds: number[]) {
        participantIds.forEach((participantId) => {
            const socketIds = userSockets.get(participantId);
            if (socketIds) {
                socketIds.forEach((socketId) => {
                    this.server.to(socketId).emit('session:user-left', {
                        sessionId,
                        userId,
                        userName,
                    });
                });
            }
        });
    }

    /**
     * Notifier quand une séance est supprimée
     */
    notifySessionDeleted(sessionId: string, participantIds: number[]) {
        participantIds.forEach((participantId) => {
            const socketIds = userSockets.get(participantId);
            if (socketIds) {
                socketIds.forEach((socketId) => {
                    this.server.to(socketId).emit('session:deleted', {
                        sessionId,
                    });
                });
            }
        });
    }

    // ========== FRIEND REQUEST EVENTS ==========

    /**
     * Notifier quand une demande d'ami est reçue
     */
    notifyFriendRequestReceived(receiverId: number, friendRequest: any) {
        console.log(`👥 Envoi de notification de demande d'ami à l'utilisateur ${receiverId}`);
        const socketIds = userSockets.get(receiverId);
        if (socketIds) {
            socketIds.forEach((socketId) => {
                this.server.to(socketId).emit('friend:request-received', friendRequest);
                console.log(`    ✓ Notification envoyée au socket ${socketId}`);
            });
        } else {
            console.log(`    ⚠ Utilisateur ${receiverId} non connecté`);
        }
    }

    /**
     * Notifier quand une demande d'ami est acceptée
     */
    notifyFriendRequestAccepted(senderId: number, acceptedBy: any) {
        console.log(`✅ Notification d'acceptation de demande d'ami à l'utilisateur ${senderId}`);
        const socketIds = userSockets.get(senderId);
        if (socketIds) {
            socketIds.forEach((socketId) => {
                this.server.to(socketId).emit('friend:request-accepted', acceptedBy);
                console.log(`    ✓ Notification envoyée au socket ${socketId}`);
            });
        }
    }

    /**
     * Notifier quand une demande d'ami est refusée
     */
    notifyFriendRequestDeclined(senderId: number, declinedBy: any) {
        console.log(`❌ Notification de refus de demande d'ami à l'utilisateur ${senderId}`);
        const socketIds = userSockets.get(senderId);
        if (socketIds) {
            socketIds.forEach((socketId) => {
                this.server.to(socketId).emit('friend:request-declined', declinedBy);
                console.log(`    ✓ Notification envoyée au socket ${socketId}`);
            });
        }
    }
}
