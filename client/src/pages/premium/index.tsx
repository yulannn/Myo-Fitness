import { useState } from 'react';
import { usePremium } from '../../context/PremiumContext';
import { useNavigate } from 'react-router-dom';
import { useCreateCheckoutSession, useCancelSubscription } from '../../api/hooks/useStripe';
import ConfirmModal from '../../components/ui/modal/ConfirmModal';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CalendarIcon,
    CreditCardIcon,
    SparklesIcon,
    DocumentDuplicateIcon,
    ClipboardDocumentListIcon,
    AdjustmentsHorizontalIcon,
    ArrowPathIcon,
    ChartBarIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    TrophyIcon,
    MapIcon,
    ArrowTrendingUpIcon,
    CalendarDaysIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const FEATURES = [
    { name: "Programmes IA", free: false, premium: "Illimité", icon: SparklesIcon },
    { name: "Templates", free: "Basiques (3 types)", premium: "Avancés + Custom", icon: DocumentDuplicateIcon },
    { name: "Programmes manuels", free: "Illimité", premium: "Illimité", icon: ClipboardDocumentListIcon },
    { name: "Sessions", free: "Illimité", premium: "Illimité", icon: ClockIcon },
    { name: "Adaptation de séance", free: false, premium: "Oui", icon: AdjustmentsHorizontalIcon },
    { name: "Répéter la séance", free: "Oui", premium: "Oui", icon: ArrowPathIcon },
    { name: "Tracking complet", free: "Oui", premium: "Oui", icon: ChartBarIcon },
    { name: "Exercices", free: "Base", premium: "Base + IA + Custom", icon: ClipboardDocumentListIcon },
    { name: "Social (Amis/Groupes)", free: "Limité", premium: "Complet", icon: UserGroupIcon },
    { name: "Chat", free: "Complet", premium: "Complet", icon: ChatBubbleLeftRightIcon },
    { name: "Badges & XP", free: "Complet", premium: "Complet", icon: TrophyIcon },
    { name: "Body Atlas (Heatmap)", free: false, premium: "Historique + Time-lapse", icon: MapIcon },
    { name: "Stats", free: "Basiques (30j)", premium: "Avancées (illimité)", icon: ArrowTrendingUpIcon },
    { name: "Alternatives d'exercices", free: false, premium: "Suggestions IA", icon: ArrowPathIcon },
    { name: "Agenda/Calendrier", free: "Mois actuel", premium: "Historique complet", icon: CalendarDaysIcon },
    { name: "Export données", free: false, premium: "CSV/JSON", icon: ArrowDownTrayIcon },
];

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

    // Si l'utilisateur n'est pas premium, on commence par la vue FEATURES
    const [view, setView] = useState<'features' | 'pricing'>(isPremium ? 'pricing' : 'features');

    const handleBack = () => {
        if (view === 'pricing' && !isPremium) {
            setView('features');
        } else {
            navigate('/settings');
        }
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
                        onClick={() => navigate('/settings')}
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

    // Vue de comparaison des fonctionnalités (Landing Page style)
    if (view === 'features' && !isPremium) {
        return (
            <div className="min-h-screen bg-[#121214] pb-32 pt-6 font-[Montserrat]">
                <div className="max-w-3xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-10 space-y-4">
                        <div className="inline-block p-3 rounded-full bg-[#94fbdd]/10 mb-2 ring-1 ring-[#94fbdd]/30">
                            <SparklesIcon className="w-8 h-8 text-[#94fbdd]" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Passez au niveau <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#94fbdd] to-[#72e8cc]">Supérieur</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-lg mx-auto">
                            Débloquez tout le potentiel de Myo Fitness avec l'abonnement Premium.
                        </p>
                    </div>

                    {/* Tableau comparatif stylisé */}
                    <div className="bg-[#18181b] rounded-3xl border border-[#94fbdd]/10 overflow-hidden shadow-2xl relative">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#94fbdd]/5 rounded-full blur-3xl pointer-events-none" />

                        {/* Headers du tableau (Sticky sur mobile ?) */}
                        <div className="grid grid-cols-12 gap-2 p-4 sm:p-6 border-b border-white/5 bg-[#18181b]/95 backdrop-blur-sm sticky top-0 z-10 items-center">
                            <div className="col-span-6 sm:col-span-5 text-sm font-bold text-gray-500 uppercase tracking-wider">Fonctionnalité</div>
                            <div className="col-span-3 sm:col-span-3 text-center text-sm font-bold text-gray-500 uppercase tracking-wider">Gratuit</div>
                            <div className="col-span-3 sm:col-span-4 text-center">
                                <span className="inline-block px-3 py-1 rounded-full bg-[#94fbdd]/10 border border-[#94fbdd]/20 text-[#94fbdd] text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(148,251,221,0.2)]">
                                    PREMIUM
                                </span>
                            </div>
                        </div>

                        {/* Liste des features */}
                        <div className="divide-y divide-white/5">
                            {FEATURES.map((feature, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 p-4 sm:p-5 items-center hover:bg-white/[0.02] transition-colors relative z-0">
                                    {/* Feature Name */}
                                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3 pr-2">
                                        <feature.icon className="w-5 h-5 text-gray-500 flex-shrink-0 hidden sm:block" />
                                        <span className="text-white font-medium text-sm sm:text-base leading-tight">{feature.name}</span>
                                    </div>

                                    {/* Free Value */}
                                    <div className="col-span-3 sm:col-span-3 flex justify-center text-center px-1">
                                        {feature.free === false ? (
                                            <XMarkIcon className="w-6 h-6 text-gray-700/50" />
                                        ) : feature.free === "Oui" || feature.free === "Illimité" || feature.free === "Complet" ? (
                                            <CheckIcon className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <span className="text-xs sm:text-sm text-gray-500 font-medium">{feature.free}</span>
                                        )}
                                    </div>

                                    {/* Premium Value */}
                                    <div className="col-span-3 sm:col-span-4 flex justify-center text-center px-1">
                                        {feature.premium === "Complet" || feature.premium === "Illimité" || feature.premium === "Oui" ? (
                                            <div className="w-8 h-8 rounded-full bg-[#94fbdd]/10 flex items-center justify-center ring-1 ring-[#94fbdd]/20 shadow-[0_0_10px_rgba(148,251,221,0.1)]">
                                                <CheckIcon className="w-5 h-5 text-[#94fbdd]" />
                                            </div>
                                        ) : (
                                            <span className="text-xs sm:text-sm font-bold text-[#94fbdd] drop-shadow-[0_0_5px_rgba(148,251,221,0.3)]">
                                                {feature.premium}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sticky Footer Button */}
                    <div className="sticky bottom-4 mt-8 pb-4 w-full z-20">
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#121214] to-transparent -z-10" />
                        <button
                            onClick={() => setView('pricing')}
                            className="w-full py-4 rounded-2xl bg-[#94fbdd] text-[#121214] text-lg font-bold hover:bg-[#7de3c7] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(148,251,221,0.3)] flex items-center justify-center gap-2"
                        >
                            <span>Voir les offres</span>
                            <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-full mt-4 text-gray-500 text-sm font-medium hover:text-gray-300 transition-colors"
                        >
                            Non merci, peut-être plus tard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Vue Pricing / Status (Standard)
    const statusColor = getStatusColor(subscription?.status || 'FREE');

    return (
        <div className="min-h-screen bg-[#121214] pb-24">
            <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
                {/* Simple Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors mb-4"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Retour</span>
                </button>

                {/* Badge de statut principal */}
                {isPremium && (
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
                )}

                {/* Si l'utilisateur n'est pas premium, afficher les plans */}
                {!isPremium && view === 'pricing' && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2 mb-8">
                            <h2 className="text-2xl font-bold text-white">Choisissez votre offre</h2>
                            <p className="text-gray-400">Investissez dans votre progression dès aujourd'hui.</p>
                        </div>

                        {/* Plan Mensuel */}
                        <div className="bg-[#252527] border border-[#94fbdd]/20 rounded-2xl p-6 hover:border-[#94fbdd]/40 transition-all cursor-pointer relative group" onClick={() => handleSubscribe('monthly')}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#94fbdd] transition-colors">Mensuel</h3>
                                    <p className="text-gray-400 text-sm">Liberté totale, sans engagement</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-[#94fbdd]">8,00€</div>
                                    <div className="text-sm text-gray-400">/mois</div>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleSubscribe('monthly'); }}
                                disabled={isCheckoutLoading && selectedPlan === 'monthly'}
                                className="w-full py-3 px-4 rounded-xl font-semibold text-[#94fbdd] bg-[#94fbdd]/10 border border-[#94fbdd]/30 hover:bg-[#94fbdd]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCheckoutLoading && selectedPlan === 'monthly' ? 'Redirection...' : "Choisir l'offre mensuelle"}
                            </button>
                        </div>

                        {/* Plan Annuel (avec badge "Économisez 17%") */}
                        <div className="bg-gradient-to-b from-[#252527] to-[#121214] border-2 border-[#94fbdd] rounded-2xl p-6 relative overflow-hidden transform hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(148,251,221,0.1)] cursor-pointer" onClick={() => handleSubscribe('yearly')}>
                            <div className="absolute top-0 right-0">
                                <div className="bg-[#94fbdd] text-[#121214] text-xs font-bold px-4 py-1 rounded-bl-xl shadow-lg">
                                    MEILLEURE OFFRE
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6 mt-2">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Annuel</h3>
                                    <p className="text-[#94fbdd] text-sm font-medium">Économisez 2 mois !</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-[#94fbdd]">80,00€</div>
                                    <div className="text-sm text-gray-400">/an</div>
                                    <div className="text-xs text-gray-500 mt-1 bg-white/5 rounded px-2 py-0.5 inline-block">Soit 6,66€/mois</div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleSubscribe('yearly'); }}
                                disabled={isCheckoutLoading && selectedPlan === 'yearly'}
                                className="w-full py-4 px-4 rounded-xl font-bold text-[#121214] bg-[#94fbdd] hover:bg-[#7de3c7] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#94fbdd]/20"
                            >
                                {isCheckoutLoading && selectedPlan === 'yearly' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                                        Redirection...
                                    </>
                                ) : (
                                    <>
                                        <CreditCardIcon className="h-5 w-5" />
                                        Choisir l'offre annuelle
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <CheckCircleSolid className="w-4 h-4 text-[#94fbdd]" />
                                <span>Paiement unique de 80€, sans frais cachés</span>
                            </div>
                        </div>

                        {/* Sécurité Stripe */}
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5zm0 18.5c-4.4-1.1-7-4.8-7-8.5V8.3l7-3.5 7 3.5V12c0 3.7-2.6 7.4-7 8.5z" />
                            </svg>
                            <span>Paiement sécurisé crypté SSL via Stripe</span>
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
