import { Subscription as PrismaSubscription, PremiumStatus, SubscriptionPlan } from '@prisma/client';

export class Subscription implements PrismaSubscription {
    id: number;
    userId: number;

    // Plan et statut
    plan: SubscriptionPlan;
    status: PremiumStatus;

    // Dates importantes
    startDate: Date | null;
    endDate: Date | null;
    trialStartDate: Date | null;
    trialEndDate: Date | null;
    cancelledAt: Date | null;

    // Informations de paiement
    lastPaymentDate: Date | null;
    nextBillingDate: Date | null;
    paymentProvider: string | null;
    externalPaymentId: string | null;

    // Métadonnées
    autoRenew: boolean;
    cancelledBy: string | null;

    createdAt: Date;
    updatedAt: Date;

    // Méthodes utilitaires
    isPremium(): boolean {
        return this.status === 'ACTIVE' || this.status === 'TRIAL';
    }

    isActive(): boolean {
        if (this.status !== 'ACTIVE' && this.status !== 'TRIAL') {
            return false;
        }

        if (this.endDate && new Date() > this.endDate) {
            return false;
        }

        return true;
    }

    isTrial(): boolean {
        return this.status === 'TRIAL' &&
            this.trialEndDate !== null &&
            new Date() <= this.trialEndDate;
    }

    daysRemaining(): number | null {
        if (!this.endDate) return null;

        const now = new Date();
        const diffTime = this.endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    }
}
