import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePremium } from '../../contexts/PremiumContext';

interface PremiumGuardProps {
    children: React.ReactNode;
    redirectTo?: string;
    fallback?: React.ReactNode;
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({
    children,
    redirectTo = '/premium',
    fallback,
}) => {
    const { isPremium, isPremiumLoading } = usePremium();

    if (isPremiumLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#121214]">
                <div className="w-8 h-8 border-4 border-[#94fbdd]/30 border-t-[#94fbdd] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isPremium) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export const withPremiumGuard = <P extends object>(
    Component: React.ComponentType<P>,
    options?: Omit<PremiumGuardProps, 'children'>
) => {
    return (props: P) => (
        <PremiumGuard {...options}>
            <Component {...props} />
        </PremiumGuard>
    );
};
