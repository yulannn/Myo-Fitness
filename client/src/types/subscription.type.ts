export const PremiumStatus = {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
    TRIAL: 'TRIAL',
} as const;

export type PremiumStatus = typeof PremiumStatus[keyof typeof PremiumStatus];

export const SubscriptionPlan = {
    FREE: 'FREE',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
    LIFETIME: 'LIFETIME',
} as const;

export type SubscriptionPlan = typeof SubscriptionPlan[keyof typeof SubscriptionPlan];

export interface Subscription {
    id: number;
    userId: number;
    plan: SubscriptionPlan;
    status: PremiumStatus;

    startDate: string | null;
    endDate: string | null;
    trialStartDate: string | null;
    trialEndDate: string | null;

    autoRenew: boolean;

    // Informations calculées
    isPremium: boolean;
    isActive: boolean;
    isTrial: boolean;
    daysRemaining: number | null;

    createdAt: string;
    updatedAt: string;
}

export interface CreateSubscriptionPayload {
    plan: SubscriptionPlan;
    status?: PremiumStatus;
    startDate?: string;
    endDate?: string;
    trialStartDate?: string;
    trialEndDate?: string;
    autoRenew?: boolean;
    paymentProvider?: string;
    externalPaymentId?: string;
}

export interface UpdateSubscriptionPayload {
    plan?: SubscriptionPlan;
    status?: PremiumStatus;
    cancelledAt?: string;
    cancelledBy?: string;
}

export interface RenewSubscriptionPayload {
    plan?: SubscriptionPlan;
}

export interface StartTrialPayload {
    durationDays?: number;
}
