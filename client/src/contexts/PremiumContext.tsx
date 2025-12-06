import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useMySubscription, useIsPremium } from '../api/hooks/useSubscription';
import type { Subscription } from '../types/subscription.type';

interface PremiumContextValue {
    subscription: Subscription | null | undefined;
    isSubscriptionLoading: boolean;
    isSubscriptionError: boolean;
    isPremium: boolean;
    isPremiumLoading: boolean;
    isPremiumError: boolean;
    refetchSubscription: () => void;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

interface PremiumProviderProps {
    children: ReactNode;
}

export const PremiumProvider: React.FC<PremiumProviderProps> = ({ children }) => {
    const {
        data: subscription,
        isLoading: isSubscriptionLoading,
        isError: isSubscriptionError,
        refetch: refetchSubscription,
    } = useMySubscription();

    const {
        data: premiumStatus,
        isLoading: isPremiumLoading,
        isError: isPremiumError,
        refetch: refetchPremium,
    } = useIsPremium();

    const isPremium = premiumStatus?.isPremium ?? false;

    const handleRefetch = () => {
        refetchSubscription();
        refetchPremium();
    };

    const value: PremiumContextValue = {
        subscription,
        isSubscriptionLoading,
        isSubscriptionError,
        isPremium,
        isPremiumLoading,
        isPremiumError,
        refetchSubscription: handleRefetch,
    };

    return (
        <PremiumContext.Provider value={value}>
            {children}
        </PremiumContext.Provider>
    );
};

export const usePremium = (): PremiumContextValue => {
    const context = useContext(PremiumContext);

    if (context === undefined) {
        throw new Error('usePremium must be used within a PremiumProvider');
    }

    return context;
};
