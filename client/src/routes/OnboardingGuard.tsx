import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFitnessProfilesByUser } from '../api/hooks/fitness-profile/useGetFitnessProfilesByUser';
import { useOnboardingStore } from '../stores/onboardingStore';
import { ONBOARDING } from '../utils/paths';

interface OnboardingGuardProps {
    children: ReactNode;
}

/**
 * Guard qui redirige vers l'onboarding si l'utilisateur n'a pas de fitness profile
 * et que l'onboarding n'a pas été complété
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: profiles, isLoading } = useFitnessProfilesByUser();
    const { isCompleted } = useOnboardingStore();

    useEffect(() => {
        // Ne pas rediriger si on est déjà sur la page d'onboarding
        if (location.pathname === ONBOARDING) return;

        // Attendre que les données soient chargées
        if (isLoading) return;

        // Si pas de profile ET onboarding pas complété --> rediriger
        const hasProfiles = Array.isArray(profiles) ? profiles.length > 0 : !!profiles;
        if (!hasProfiles && !isCompleted) {
            navigate(ONBOARDING, { replace: true });
        }
    }, [profiles, isLoading, isCompleted, navigate, location.pathname]);

    // Afficher un loader pendant la vérification
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#121214]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#94fbdd]/20 border-t-[#94fbdd]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-[#94fbdd]/20 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
