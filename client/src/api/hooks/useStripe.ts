import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stripeService } from '../services/stripeService';

export const useCreateCheckoutSession = () => {
    return useMutation({
        mutationFn: (plan: 'monthly' | 'yearly') => stripeService.createCheckoutSession(plan),
        onSuccess: (data: { sessionId: string; url: string }) => {
            // Rediriger vers Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            }
        },
    });
};

export const useCancelSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: stripeService.cancelSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
    });
};
