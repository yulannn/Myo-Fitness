import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePremium } from '../../contexts/PremiumContext';
import { stripeService } from '../../api/services/stripeService';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function PremiumSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refetchSubscription } = usePremium();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifyAndRefetch = async () => {
            if (sessionId) {
                try {
                    // Vérifier la session côté backend (ceci activera l'abonnement si nécessaire)
                    await stripeService.verifySession(sessionId);
                    // Rafraîchir les données d'abonnement
                    await refetchSubscription();
                } catch (error) {
                    console.error('Erreur lors de la vérification de la session:', error);
                }
            }
        };

        verifyAndRefetch();
    }, [sessionId, refetchSubscription]);

    const handleContinue = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#121214] flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 text-center">
                {/* Icône de succès avec animation */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                        <div className="relative bg-green-500/10 p-6 rounded-full border-2 border-green-500/30">
                            <CheckCircleIcon className="h-16 w-16 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Message de succès */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                        <SparklesIcon className="h-8 w-8 text-[#94fbdd]" />
                        Bienvenue Premium !
                    </h1>
                    <p className="text-lg text-gray-300">
                        Votre paiement a été traité avec succès
                    </p>
                    <p className="text-sm text-gray-400">
                        Vous avez maintenant accès à toutes les fonctionnalités premium de Myo Fitness
                    </p>
                </div>

                {/* Informations */}
                <div className="bg-[#252527] border border-[#94fbdd]/20 rounded-xl p-6 space-y-3">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-2 h-2 bg-[#94fbdd] rounded-full"></div>
                        <span className="text-gray-300">Accès illimité aux programmes personnalisés</span>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-2 h-2 bg-[#94fbdd] rounded-full"></div>
                        <span className="text-gray-300">Statistiques avancées</span>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-2 h-2 bg-[#94fbdd] rounded-full"></div>
                        <span className="text-gray-300">Support prioritaire</span>
                    </div>
                </div>

                {/* Bouton */}
                <button
                    onClick={handleContinue}
                    className="w-full py-4 px-6 rounded-xl font-semibold text-[#121214] bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] hover:from-[#7de3c7] hover:to-[#94fbdd] transition-all shadow-lg shadow-[#94fbdd]/20"
                >
                    Commencer à utiliser Premium
                </button>

                {sessionId && (
                    <p className="text-xs text-gray-500">
                        Session ID: {sessionId.slice(0, 20)}...
                    </p>
                )}
            </div>
        </div>
    );
}
