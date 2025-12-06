import React from 'react';
import { usePremium } from '../../contexts/PremiumContext';
import './PremiumBadge.css';

interface PremiumBadgeProps {
    /**
     * Taille du badge
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Afficher uniquement l'icône (sans texte)
     */
    iconOnly?: boolean;
    /**
     * Classe CSS personnalisée
     */
    className?: string;
}

/**
 * Badge pour indiquer le statut premium d'un utilisateur
 */
export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
    size = 'medium',
    iconOnly = false,
    className = '',
}) => {
    const { isPremium, subscription } = usePremium();

    if (!isPremium || !subscription) {
        return null;
    }

    const isTrial = subscription.isTrial;

    return (
        <div className={`premium-badge premium-badge--${size} ${className}`}>
            <span className="premium-badge__icon">⭐</span>
            {!iconOnly && (
                <span className="premium-badge__text">
                    {isTrial ? 'Essai Premium' : 'Premium'}
                </span>
            )}
        </div>
    );
};

interface SubscriptionInfoProps {
    /**
     * Afficher les détails complets
     */
    detailed?: boolean;
}

/**
 * Composant pour afficher les informations de souscription
 */
export const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({
    detailed = false,
}) => {
    const { subscription, isPremium, isSubscriptionLoading } = usePremium();

    if (isSubscriptionLoading) {
        return <div className="subscription-info__loading">Chargement...</div>;
    }

    if (!subscription) {
        return (
            <div className="subscription-info subscription-info--free">
                <h3>Compte Gratuit</h3>
                <p>Passez au Premium pour débloquer toutes les fonctionnalités</p>
            </div>
        );
    }

    return (
        <div className={`subscription-info subscription-info--${subscription.status.toLowerCase()}`}>
            <div className="subscription-info__header">
                <h3>
                    {subscription.plan === 'FREE' ? 'Gratuit' :
                        subscription.plan === 'MONTHLY' ? 'Mensuel' :
                            subscription.plan === 'YEARLY' ? 'Annuel' :
                                'À vie'}
                </h3>
                {isPremium && <PremiumBadge size="small" />}
            </div>

            {detailed && (
                <div className="subscription-info__details">
                    {subscription.isTrial && (
                        <p className="subscription-info__trial">
                            🎉 Essai gratuit en cours
                        </p>
                    )}

                    {subscription.endDate && (
                        <p className="subscription-info__expiry">
                            {subscription.isActive ? (
                                <>
                                    Expire le: {new Date(subscription.endDate).toLocaleDateString()}
                                    {subscription.daysRemaining !== null && (
                                        <span className="subscription-info__days-remaining">
                                            {' '}({subscription.daysRemaining} jours restants)
                                        </span>
                                    )}
                                </>
                            ) : (
                                <>Expiré le: {new Date(subscription.endDate).toLocaleDateString()}</>
                            )}
                        </p>
                    )}

                    {subscription.autoRenew && (
                        <p className="subscription-info__auto-renew">
                            ✓ Renouvellement automatique activé
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
