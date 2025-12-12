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
            subscription_data: {
                metadata: {
                    userId: userId.toString(),
                    plan: plan,
                },
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
     * ⚠️ Fallback: Si le paiement est réussi mais que le webhook n'a pas encore activé l'abonnement,
     * cette méthode activera l'abonnement directement (utile en développement local sans Stripe CLI)
     */
    async verifyCheckoutSession(sessionId: string) {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);

        // Récupérer l'abonnement local pour vérifier s'il a été créé par le webhook
        const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : null;
        let localSubscription: any = null;
        let wasActivatedByFallback = false;

        if (userId) {
            localSubscription = await this.subscriptionService.findByUserId(userId);
        }

        // 🚨 FALLBACK: Si le paiement est réussi mais pas d'abonnement actif, activer manuellement
        // Cela gère le cas où le webhook n'a pas pu être reçu (ex: développement local)
        if (
            session.payment_status === 'paid' &&
            session.subscription &&
            userId &&
            (!localSubscription || localSubscription.status !== 'ACTIVE')
        ) {
            try {
                // Récupérer les détails de l'abonnement Stripe
                const stripeSubscription = await this.stripe.subscriptions.retrieve(
                    session.subscription as string
                ) as any;

                const plan = session.metadata!.plan as 'monthly' | 'yearly';
                const subscriptionPlan = plan === 'monthly' ? SubscriptionPlan.MONTHLY : SubscriptionPlan.YEARLY;

                if (localSubscription) {
                    // Mettre à jour l'abonnement existant
                    await this.subscriptionService.update(userId, {
                        plan: subscriptionPlan,
                        status: 'ACTIVE',
                        startDate: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                        endDate: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                        autoRenew: true,
                        externalPaymentId: stripeSubscription.id,
                    });
                } else {
                    // Créer un nouvel abonnement
                    await this.subscriptionService.create(userId, {
                        plan: subscriptionPlan,
                        status: 'ACTIVE',
                        startDate: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                        endDate: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                        autoRenew: true,
                        paymentProvider: 'stripe',
                        externalPaymentId: stripeSubscription.id,
                    });
                }

                // Rafraîchir les données locales
                localSubscription = await this.subscriptionService.findByUserId(userId);
                wasActivatedByFallback = true;
            } catch (error) {
                console.error(`❌ Fallback activation failed for user ${userId}:`, error);
            }
        }

        return {
            status: session.payment_status,
            customerId: session.customer,
            subscriptionId: session.subscription,
            // Indiquer si l'abonnement a déjà été activé
            isActivated: localSubscription?.status === 'ACTIVE',
            wasActivatedByFallback,
            localSubscription: localSubscription,
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
                break;
        }
    }

    /**
     * Gère la complétion d'une session de checkout
     * ⚡ Cette méthode est appelée par le webhook Stripe
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

        // 🔒 VALIDATION DE SÉCURITÉ: Vérifier que le Prix ID correspond au plan
        const expectedPriceId = plan === 'monthly'
            ? process.env.STRIPE_MONTHLY_PRICE_ID
            : process.env.STRIPE_YEARLY_PRICE_ID;

        const actualPriceId = subscription.items.data[0]?.price?.id;

        if (actualPriceId !== expectedPriceId) {
            console.error(`❌ SECURITY ALERT: Price mismatch for user ${userId}`);
            console.error(`   Expected: ${expectedPriceId}`);
            console.error(`   Actual: ${actualPriceId}`);
            throw new BadRequestException('Price validation failed: subscription does not match expected plan');
        }

        // Vérifier si l'abonnement existe déjà (éviter les doublons)
        const existingSubscription = await this.subscriptionService.findByUserId(userId);

        if (existingSubscription) {
            // Si l'abonnement existe déjà avec le même externalPaymentId, c'est un doublon
            if (existingSubscription.externalPaymentId === subscription.id) {
                return;
            }

            // Sinon, mettre à jour l'abonnement existant
            await this.subscriptionService.update(userId, {
                plan: subscriptionPlan,
                status: 'ACTIVE',
                startDate: new Date(subscription.current_period_start * 1000).toISOString(),
                endDate: new Date(subscription.current_period_end * 1000).toISOString(),
                autoRenew: true,
                externalPaymentId: subscription.id,
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
    }

    /**
     * Gère la mise à jour d'un abonnement
     */
    private async handleSubscriptionUpdated(subscription: any) {
        const userId = parseInt(subscription.metadata?.userId);

        if (!userId) {
            console.error('❌ No userId in subscription metadata');
            console.error('   Subscription ID:', subscription.id);
            console.error('   Customer:', subscription.customer);
            console.error('   Metadata:', JSON.stringify(subscription.metadata || {}));
            console.error('   ⚠️  This subscription was likely created manually or is missing metadata');
            return;
        }

        await this.subscriptionService.update(userId, {
            startDate: new Date(subscription.current_period_start * 1000).toISOString(),
            endDate: new Date(subscription.current_period_end * 1000).toISOString(),
        });
    }

    /**
     * Gère la suppression/annulation d'un abonnement
     */
    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        const userId = parseInt(subscription.metadata?.userId);

        if (!userId) {
            console.error('❌ No userId in subscription metadata');
            console.error('   Subscription ID:', subscription.id);
            console.error('   Customer:', subscription.customer);
            console.error('   Metadata:', JSON.stringify(subscription.metadata || {}));
            console.error('   ⚠️  Cannot cancel subscription without userId');
            return;
        }

        await this.subscriptionService.cancel(userId, 'stripe');
    }

    /**
     * Gère le succès d'un paiement de facture
     */
    private async handleInvoicePaymentSucceeded(invoice: any) {
        // Le paiement a réussi, l'abonnement est automatiquement renouvelé
    }

    /**
     * Gère l'échec d'un paiement de facture
     */
    private async handleInvoicePaymentFailed(invoice: any) {
        // Le paiement a échoué, vous pourriez vouloir notifier l'utilisateur
    }
}
