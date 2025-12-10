import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscriptionService';
import type {
    CreateSubscriptionPayload,
    UpdateSubscriptionPayload,
    RenewSubscriptionPayload,
    StartTrialPayload,
} from '../../types/subscription.type';

// Query Keys
export const subscriptionKeys = {
    all: ['subscription'] as const,
    mySubscription: () => [...subscriptionKeys.all, 'me'] as const,
    isPremium: () => [...subscriptionKeys.all, 'is-premium'] as const,
};

/**
 * Hook pour récupérer la souscription de l'utilisateur
 */
export const useMySubscription = (enabled: boolean = true) => {
    return useQuery({
        queryKey: subscriptionKeys.mySubscription(),
        queryFn: subscriptionService.getMySubscription,
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            // Ne pas réessayer sur les erreurs 404 (utilisateur sans abonnement)
            if (error?.response?.status === 404) {
                return false;
            }
            // Réessayer jusqu'à 2 fois pour les autres erreurs
            return failureCount < 2;
        },
    });
};

/**
 * Hook pour vérifier si l'utilisateur est premium
 */
export const useIsPremium = (enabled: boolean = true) => {
    return useQuery({
        queryKey: subscriptionKeys.isPremium(),
        queryFn: subscriptionService.checkPremium,
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 404) {
                return false;
            }
            return failureCount < 2;
        },
    });
};

/**
 * Hook pour créer une souscription
 */
export const useCreateSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateSubscriptionPayload) =>
            subscriptionService.createSubscription(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
        },
    });
};

/**
 * Hook pour mettre à jour une souscription
 */
export const useUpdateSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateSubscriptionPayload) =>
            subscriptionService.updateSubscription(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
        },
    });
};

/**
 * Hook pour annuler une souscription
 */
export const useCancelSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: subscriptionService.cancelSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
        },
    });
};

/**
 * Hook pour renouveler une souscription
 */
export const useRenewSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload?: RenewSubscriptionPayload) =>
            subscriptionService.renewSubscription(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
        },
    });
};

/**
 * Hook pour démarrer un essai gratuit
 */
export const useStartTrial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload?: StartTrialPayload) =>
            subscriptionService.startTrial(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
        },
    });
};
