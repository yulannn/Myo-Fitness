import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../apiClient';

interface ChatMessage {
    id: string;
    role: 'USER' | 'ASSISTANT';
    content: string;
    createdAt: string;
}

interface ChatResponse {
    message: string;
    conversationHistory?: ChatMessage[];
}

interface StatsResponse {
    totalMessages: number;
    todayMessages: number;
    remainingToday: number;
}

/**
 * 💬 Hook pour envoyer un message au chatbot
 */
export const useSendChatMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (message: string) => {
            const { data } = await apiClient.post<ChatResponse>('/ai-chatbot/chat', { message });
            return data;
        },
        onSuccess: () => {
            // Invalider l'historique et les stats après un nouveau message
            queryClient.invalidateQueries({ queryKey: ['ai-chatbot-history'] });
            queryClient.invalidateQueries({ queryKey: ['ai-chatbot-stats'] });
        },
    });
};

/**
 * 📜 Hook pour récupérer l'historique
 */
export const useGetChatHistory = (limit = 50, offset = 0) => {
    return useQuery({
        queryKey: ['ai-chatbot-history', limit, offset],
        queryFn: async () => {
            const { data } = await apiClient.get<ChatMessage[]>('/ai-chatbot/history', {
                params: { limit, offset },
            });
            return data;
        },
    });
};

/**
 * 🗑️ Hook pour effacer l'historique
 */
export const useClearChatHistory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.delete('/ai-chatbot/history');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-chatbot-history'] });
            queryClient.invalidateQueries({ queryKey: ['ai-chatbot-stats'] });
        },
    });
};

/**
 * 📊 Hook pour les statistiques
 */
export const useGetChatStats = () => {
    return useQuery({
        queryKey: ['ai-chatbot-stats'],
        queryFn: async () => {
            const { data } = await apiClient.get<StatsResponse>('/ai-chatbot/stats');
            return data;
        },
    });
};
