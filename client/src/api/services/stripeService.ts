import apiClient from '../apiClient';

export const stripeService = {
    /**
     * Crée une session de paiement Stripe
     */
    createCheckoutSession: async (plan: 'monthly' | 'yearly'): Promise<{ sessionId: string; url: string }> => {
        const response = await apiClient.post<{ sessionId: string; url: string }>(
            '/stripe/create-checkout-session',
            { plan }
        );
        return response.data;
    },

    /**
     * Vérifie le statut d'une session de paiement
     */
    verifySession: async (sessionId: string) => {
        const response = await apiClient.get(`/stripe/verify-session`, {
            params: { session_id: sessionId }
        });
        return response.data;
    },
    /**
     * Annule l'abonnement
     */
    cancelSubscription: async () => {
        const response = await apiClient.post('/stripe/cancel-subscription');
        return response.data;
    },
};
