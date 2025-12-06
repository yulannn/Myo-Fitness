import { useState } from 'react';
import { usePremium } from '../../contexts/PremiumContext';
import { useNavigate } from 'react-router-dom';
import { useCreateCheckoutSession, useCancelSubscription } from '../../api/hooks/useStripe';
import ConfirmModal from '../../components/ui/modal/ConfirmModal';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CalendarIcon,
    SparklesIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

export default function Premium() {
    const navigate = useNavigate();
    const {
        subscription,
        isSubscriptionLoading,
        isPremium,
        isSubscriptionError
    } = usePremium();

    const { mutate: createCheckout, isPending: isCheckoutLoading } = useCreateCheckoutSession();
    const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const handleBack = () => {
        navigate('/settings');
    };

    const handleSubscribe = (plan: 'monthly' | 'yearly') => {
        setSelectedPlan(plan);
        createCheckout(plan);
    };

    const handleCancelSubscription = () => {
        cancelSubscription(undefined, {
            onSuccess: () => {
                setIsCancelModalOpen(false);
            }
        });
    };

    if (isSubscriptionLoading) {
        return (
            <div className="min-h-screen bg-[#121214] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#94fbdd]/30 border-t-[#94fbdd] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (isSubscriptionError) {
        return (
            <div className="min-h-screen bg-[#121214] pb-24">
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors mb-8"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Retour</span>
                    </button>
                    <div className="text-center text-red-400">
                        Erreur lors du chargement des informations d'abonnement
                    </div>
                </div>
            </div>
        );
    }

    const statusColor = getStatusColor(subscription?.status || 'FREE');

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
                {/* Header avec bouton retour */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-[#94fbdd]" />
                        Mon Abonnement Premium
                    </h1>
                </div>

                {/* Badge de statut principal */}
                <div className={`p-6 rounded-2xl border ${statusColor.bg} ${statusColor.border}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {isPremium ? (
                                <CheckCircleSolid className={`h-8 w-8 ${statusColor.text}`} />
                            ) : (
                                <XCircleIcon className={`h-8 w-8 ${statusColor.text}`} />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {getStatusLabel(subscription?.status || 'FREE')}
                                </h2>
                                <p className={`text-sm ${statusColor.text}`}>
                                    Plan {getPlanLabel(subscription?.plan || 'FREE')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Si l'utilisateur n'est pas premium, afficher les plans */}
                {!isPremium && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white">Choisissez votre plan</h2>

                        {/* Plan Mensuel */}
                        <div className="bg-[#252527] border border-[#94fbdd]/20 rounded-xl p-6 hover:border-[#94fbdd]/40 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Mensuel</h3>
                                    <p className="text-gray-400 text-sm">Facturation mensuelle</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-[#94fbdd]">9,99€</div>
                                    <div className="text-sm text-gray-400">/mois</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSubscribe('monthly')}
                                disabled={isCheckoutLoading && selectedPlan === 'monthly'}
                                className="w-full py-3 px-4 rounded-xl font-semibold text-[#121214] bg-[#94fbdd] hover:bg-[#7de3c7] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCheckoutLoading && selectedPlan === 'monthly' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                                        Redirection...
                                    </>
                                ) : (
                                    <>
                                        <CreditCardIcon className="h-5 w-5" />
                                        S'abonner
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Plan Annuel (avec badge "Économisez 17%") */}
                        <div className="bg-[#252527] border-2 border-[#94fbdd] rounded-xl p-6 relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#94fbdd] text-[#121214] px-3 py-1 rounded-full text-xs font-bold">
                                ÉCONOMISEZ 17%
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Annuel</h3>
                                    <p className="text-gray-400 text-sm">Facturation annuelle</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-[#94fbdd]">99,99€</div>
                                    <div className="text-sm text-gray-400">/an</div>
                                    <div className="text-xs text-gray-500">soit 8,33€/mois</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSubscribe('yearly')}
                                disabled={isCheckoutLoading && selectedPlan === 'yearly'}
                                className="w-full py-3 px-4 rounded-xl font-semibold text-[#121214] bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] hover:from-[#7de3c7] hover:to-[#94fbdd] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#94fbdd]/20 flex items-center justify-center gap-2"
                            >
                                {isCheckoutLoading && selectedPlan === 'yearly' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                                        Redirection...
                                    </>
                                ) : (
                                    <>
                                        <CreditCardIcon className="h-5 w-5" />
                                        S'abonner
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Sécurité Stripe */}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5zm0 18.5c-4.4-1.1-7-4.8-7-8.5V8.3l7-3.5 7 3.5V12c0 3.7-2.6 7.4-7 8.5z" />
                            </svg>
                            <span>Paiement sécurisé par Stripe</span>
                        </div>
                    </div>
                )}

                {/* Si l'utilisateur est premium, afficher les détails de l'abonnement */}
                {isPremium && subscription && (
                    <div className="space-y-4">
                        {/* Date de début */}
                        <div className="bg-[#252527] border border-[#94fbdd]/20 rounded-xl p-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-[#94fbdd]/10 rounded-lg">
                                    <CalendarIcon className="h-5 w-5 text-[#94fbdd]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-400">Date de début</h3>
                                    <p className="text-lg font-semibold text-white mt-1">
                                        {subscription?.isTrial
                                            ? formatDate(subscription.trialStartDate)
                                            : formatDate(subscription?.startDate || null)
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Prochaine échéance / Date de fin */}
                        <div className="bg-[#252527] border border-[#94fbdd]/20 rounded-xl p-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-[#94fbdd]/10 rounded-lg">
                                    <ClockIcon className="h-5 w-5 text-[#94fbdd]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-400">
                                        {subscription?.isActive ? 'Prochaine échéance' : 'Date de fin'}
                                    </h3>
                                    <p className="text-lg font-semibold text-white mt-1">
                                        {subscription?.isTrial
                                            ? formatDate(subscription.trialEndDate)
                                            : formatDate(subscription?.endDate || null)
                                        }
                                    </p>
                                    {subscription?.daysRemaining !== null && subscription?.daysRemaining !== undefined && (
                                        <p className="text-sm text-gray-400 mt-1">
                                            {subscription.daysRemaining > 0
                                                ? `${subscription.daysRemaining} jour${subscription.daysRemaining > 1 ? 's' : ''} restant${subscription.daysRemaining > 1 ? 's' : ''}`
                                                : 'Expiré'
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Renouvellement automatique */}
                        {subscription?.plan !== 'FREE' && subscription?.plan !== 'LIFETIME' && (
                            <div className="bg-[#252527] border border-[#94fbdd]/20 rounded-xl p-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-[#94fbdd]/10 rounded-lg">
                                        {subscription?.autoRenew ? (
                                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                        ) : (
                                            <XCircleIcon className="h-5 w-5 text-red-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-400">Renouvellement automatique</h3>
                                        <p className="text-lg font-semibold text-white mt-1">
                                            {subscription?.autoRenew ? 'Activé' : 'Désactivé'}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {subscription?.autoRenew
                                                ? "Votre abonnement sera renouvelé automatiquement"
                                                : "Votre abonnement ne sera pas renouvelé"
                                            }
                                        </p>

                                        {subscription?.autoRenew && (
                                            <>
                                                <button
                                                    onClick={() => setIsCancelModalOpen(true)}
                                                    disabled={isCancelling}
                                                    className="mt-4 text-sm text-red-400 hover:text-red-300 transition-colors underline disabled:opacity-50"
                                                >
                                                    {isCancelling ? 'Résiliation en cours...' : 'Résilier l\'abonnement'}
                                                </button>

                                                <ConfirmModal
                                                    isOpen={isCancelModalOpen}
                                                    onClose={() => setIsCancelModalOpen(false)}
                                                    onConfirm={handleCancelSubscription}
                                                    title="Résilier l'abonnement ?"
                                                    message="Êtes-vous sûr de vouloir résilier votre abonnement ? Votre accès Premium restera actif jusqu'à la date d'échéance, mais il ne sera pas renouvelé automatiquement."
                                                    confirmText="Oui, résilier"
                                                    cancelText="Garder mon abonnement"
                                                    isDestructive={true}
                                                    isLoading={isCancelling}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getStatusColor(status: string): { bg: string; text: string; border: string } {
    switch (status) {
        case 'ACTIVE':
            return {
                bg: 'bg-green-500/10',
                text: 'text-green-400',
                border: 'border-green-500/20'
            };
        case 'TRIAL':
            return {
                bg: 'bg-blue-500/10',
                text: 'text-blue-400',
                border: 'border-blue-500/20'
            };
        case 'EXPIRED':
        case 'CANCELLED':
            return {
                bg: 'bg-red-500/10',
                text: 'text-red-400',
                border: 'border-red-500/20'
            };
        default:
            return {
                bg: 'bg-gray-500/10',
                text: 'text-gray-400',
                border: 'border-gray-500/20'
            };
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'ACTIVE':
            return 'Actif';
        case 'TRIAL':
            return 'Essai gratuit';
        case 'EXPIRED':
            return 'Expiré';
        case 'CANCELLED':
            return 'Annulé';
        default:
            return status;
    }
}

function getPlanLabel(plan: string): string {
    switch (plan) {
        case 'FREE':
            return 'Gratuit';
        case 'MONTHLY':
            return 'Mensuel';
        case 'YEARLY':
            return 'Annuel';
        case 'LIFETIME':
            return 'À vie';
        default:
            return plan;
    }
}
