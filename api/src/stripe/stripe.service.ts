import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private subscriptionService: SubscriptionService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2024-09-30.acacia' as any,
        });
    }

    /**
     * Crée une session Stripe Checkout pour l'abonnement
     */
    async createCheckoutSession(
        userId: number,
        plan: 'monthly' | 'yearly'
    ): Promise<{ sessionId: string; url: string }> {
        // Mapper le plan vers les IDs de prix Stripe
        const priceIds = {
            monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
            yearly: process.env.STRIPE_YEARLY_PRICE_ID,
        };

        const priceId = priceIds[plan];

        if (!priceId || priceId.includes('YOUR_')) {
            console.error(`❌ Stripe Price ID not configured for plan: ${plan}`);
            console.error(`Current value: ${priceId}`);
            throw new BadRequestException(
                `Stripe Price ID for ${plan} plan is not configured. Please check your .env file.`
            );
        }

        const session = await this.stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/premium`,
            metadata: {
                userId: userId.toString(),
                plan: plan,
            },
            customer_email: undefined, // Optionnel: ajouter l'email de l'utilisateur
        });

        return {
            sessionId: session.id,
            url: session.url!,
        };
    }

    /**
     * Annule un abonnement à la fin de la période
     */
    async cancelSubscription(userId: number) {
        // Récupérer l'abonnement local pour avoir l'ID Stripe
        const subscription = await this.subscriptionService.findByUserId(userId);

        if (!subscription || !subscription.externalPaymentId) {
            throw new BadRequestException('No active subscription found');
        }

        // Annuler dans Stripe à la fin de la période
        await this.stripe.subscriptions.update(subscription.externalPaymentId, {
            cancel_at_period_end: true,
        });

        // Mettre à jour en local pour désactiver le renouvellement auto
        await this.subscriptionService.update(userId, {
            autoRenew: false,
        });

        return { message: 'Subscription cancelled at period end' };
    }

    /**
     * Vérifie le statut d'une session de paiement
     */
    /**
     * Vérifie le statut d'une session de paiement
     */
    async verifyCheckoutSession(sessionId: string) {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);

        // Si le paiement est réussi, on s'assure que l'abonnement est activé
        // C'est utile en dev local où les webhooks ne passent pas forcément sans CLI
        if (session.payment_status === 'paid') {
            await this.handleCheckoutSessionCompleted(session);
        }

        return {
            status: session.payment_status,
            customerId: session.customer,
            subscriptionId: session.subscription,
        };
    }

    /**
     * Gère les webhooks Stripe
     */
    async handleWebhook(payload: Buffer, signature: string): Promise<void> {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err) {
            throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
        }

        // Gérer les différents types d'événements
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case 'invoice.payment_succeeded':
                await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }

    /**
     * Gère la complétion d'une session de checkout
     */
    private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
        const userId = parseInt(session.metadata!.userId);
        const plan = session.metadata!.plan as 'monthly' | 'yearly';

        // Mapper le plan vers le SubscriptionPlan Prisma
        const subscriptionPlan = plan === 'monthly' ? SubscriptionPlan.MONTHLY : SubscriptionPlan.YEARLY;

        // Récupérer les détails de l'abonnement Stripe
        const subscription = await this.stripe.subscriptions.retrieve(
            session.subscription as string
        ) as any; // Type assertion needed due to Stripe SDK typing complexity

        // Créer ou mettre à jour l'abonnement dans la base de données
        const existingSubscription = await this.subscriptionService.findByUserId(userId);

        if (existingSubscription) {
            // Mettre à jour l'abonnement existant
            await this.subscriptionService.update(userId, {
                plan: subscriptionPlan,
                status: 'ACTIVE',
                startDate: new Date(subscription.current_period_start * 1000).toISOString(),
                endDate: new Date(subscription.current_period_end * 1000).toISOString(),
            });
        } else {
            // Créer un nouvel abonnement
            await this.subscriptionService.create(userId, {
                plan: subscriptionPlan,
                status: 'ACTIVE',
                startDate: new Date(subscription.current_period_start * 1000).toISOString(),
                endDate: new Date(subscription.current_period_end * 1000).toISOString(),
                autoRenew: true,
                paymentProvider: 'stripe',
                externalPaymentId: subscription.id,
            });
        }

        console.log(`✅ Subscription activated for user ${userId}`);
    }

    /**
     * Gère la mise à jour d'un abonnement
     */
    private async handleSubscriptionUpdated(subscription: any) {
        const userId = parseInt(subscription.metadata.userId);

        if (!userId) {
            console.error('No userId in subscription metadata');
            return;
        }

        await this.subscriptionService.update(userId, {
            startDate: new Date(subscription.current_period_start * 1000).toISOString(),
            endDate: new Date(subscription.current_period_end * 1000).toISOString(),
        });

        console.log(`✅ Subscription updated for user ${userId}`);
    }

    /**
     * Gère la suppression/annulation d'un abonnement
     */
    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        const userId = parseInt(subscription.metadata.userId);

        if (!userId) {
            console.error('No userId in subscription metadata');
            return;
        }

        await this.subscriptionService.cancel(userId, 'stripe');

        console.log(`❌ Subscription cancelled for user ${userId}`);
    }

    /**
     * Gère le succès d'un paiement de facture
     */
    private async handleInvoicePaymentSucceeded(invoice: any) {
        // Le paiement a réussi, l'abonnement est automatiquement renouvelé
        console.log(`✅ Invoice paid for subscription ${invoice.subscription}`);
    }

    /**
     * Gère l'échec d'un paiement de facture
     */
    private async handleInvoicePaymentFailed(invoice: any) {
        // Le paiement a échoué, vous pourriez vouloir notifier l'utilisateur
        console.log(`❌ Invoice payment failed for subscription ${invoice.subscription}`);
    }
}
