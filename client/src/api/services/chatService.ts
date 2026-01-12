import api from '../apiClient';

export interface CreateConversationDto {
    type: 'PRIVATE' | 'GROUP';
    groupId?: number;
    name?: string;
    participantIds: number[];
}

export interface SendMessageDto {
    conversationId: string;
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'PROGRAM_SHARE';
    mediaUrl?: string;
}

const ChatService = {
    // Conversations
    getConversations: () => api.get('/chat/conversations'),

    getConversation: (id: string) => api.get(`/chat/conversations/${id}`),

    createConversation: (dto: CreateConversationDto) =>
        api.post('/chat/conversations', dto),

    leaveConversation: (id: string) =>
        api.delete(`/chat/conversations/${id}`),

    // Messages
    getMessages: (conversationId: string, skip = 0, take = 50) =>
        api.get(`/chat/conversations/${conversationId}/messages`, {
            params: { skip, take },
        }),

    sendMessage: (dto: SendMessageDto) => api.post('/chat/messages', dto),

    updateMessage: (id: string, content: string) =>
        api.patch(`/chat/messages/${id}`, { content }),

    deleteMessage: (id: string) => api.delete(`/chat/messages/${id}`),

    markAsRead: (conversationId: string) =>
        api.patch(`/chat/conversations/${conversationId}/read`),

    // Reactions
    addReaction: (messageId: string, emoji: string) =>
        api.post('/chat/reactions', { messageId, emoji }),
};

export default ChatService;
