import apiClient from '../apiClient';
import type {
    Subscription,
    CreateSubscriptionPayload,
    UpdateSubscriptionPayload,
    RenewSubscriptionPayload,
    StartTrialPayload,
} from '../../types/subscription.type';

const BASE_URL = '/subscription';

/**
 * Service pour gérer les souscriptions premium
 */
export const subscriptionService = {
    /**
     * Récupère la souscription de l'utilisateur connecté
     */
    getMySubscription: async (): Promise<Subscription | null> => {
        const response = await apiClient.get<Subscription | null>(`${BASE_URL}/me`);
        return response.data;
    },

    /**
     * Vérifie si l'utilisateur a un abonnement premium actif
     */
    checkPremium: async (): Promise<{ isPremium: boolean }> => {
        const response = await apiClient.get<{ isPremium: boolean }>(`${BASE_URL}/me/is-premium`);
        return response.data;
    },

    /**
     * Crée une nouvelle souscription
     */
    createSubscription: async (payload: CreateSubscriptionPayload): Promise<Subscription> => {
        const response = await apiClient.post<Subscription>(BASE_URL, payload);
        return response.data;
    },

    /**
     * Met à jour la souscription
     */
    updateSubscription: async (payload: UpdateSubscriptionPayload): Promise<Subscription> => {
        const response = await apiClient.put<Subscription>(BASE_URL, payload);
        return response.data;
    },

    /**
     * Annule la souscription
     */
    cancelSubscription: async (): Promise<Subscription> => {
        const response = await apiClient.delete<Subscription>(`${BASE_URL}/cancel`);
        return response.data;
    },

    /**
     * Renouvelle la souscription
     */
    renewSubscription: async (payload?: RenewSubscriptionPayload): Promise<Subscription> => {
        const response = await apiClient.post<Subscription>(`${BASE_URL}/renew`, payload);
        return response.data;
    },

    /**
     * Démarre un essai gratuit
     */
    startTrial: async (payload?: StartTrialPayload): Promise<Subscription> => {
        const response = await apiClient.post<Subscription>(`${BASE_URL}/trial`, payload);
        return response.data;
    },
};
