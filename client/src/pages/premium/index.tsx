import { usePremium } from '../../contexts/PremiumContext';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CalendarIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

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

export default function Premium() {
    const navigate = useNavigate();
    const {
        subscription,
        isSubscriptionLoading,
        isPremium,
        isSubscriptionError
    } = usePremium();

    const handleBack = () => {
        navigate('/settings');
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

                {/* Informations détaillées */}
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
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action button */}
                {!isPremium && (
                    <div className="pt-4">
                        <button
                            className="w-full py-4 px-6 rounded-xl font-semibold text-[#121214] bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] hover:from-[#7de3c7] hover:to-[#94fbdd] transition-all shadow-lg shadow-[#94fbdd]/20"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <SparklesIcon className="h-5 w-5" />
                                Passer à Premium
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
