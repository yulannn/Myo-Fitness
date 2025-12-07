import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { Subscription } from './entities/subscription.entity';
import { PremiumStatus, SubscriptionPlan } from '@prisma/client';

@Injectable()
export class SubscriptionService {
    constructor(private prisma: PrismaService) { }

    /**
     * Crée une nouvelle souscription pour un utilisateur
     */
    async create(userId: number, createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
        // Vérifier si l'utilisateur existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Vérifier si une souscription existe déjà
        const existingSubscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (existingSubscription) {
            throw new BadRequestException('User already has a subscription');
        }

        // Calculer les dates selon le plan
        const dates = this.calculateSubscriptionDates(createSubscriptionDto.plan);

        const subscription = await this.prisma.subscription.create({
            data: {
                userId,
                plan: createSubscriptionDto.plan,
                status: createSubscriptionDto.status || PremiumStatus.ACTIVE,
                startDate: createSubscriptionDto.startDate ? new Date(createSubscriptionDto.startDate) : dates.startDate,
                endDate: createSubscriptionDto.endDate ? new Date(createSubscriptionDto.endDate) : dates.endDate,
                trialStartDate: createSubscriptionDto.trialStartDate ? new Date(createSubscriptionDto.trialStartDate) : null,
                trialEndDate: createSubscriptionDto.trialEndDate ? new Date(createSubscriptionDto.trialEndDate) : null,
                autoRenew: createSubscriptionDto.autoRenew ?? false,
                paymentProvider: createSubscriptionDto.paymentProvider || null,
                externalPaymentId: createSubscriptionDto.externalPaymentId || null,
                nextBillingDate: dates.nextBillingDate,
            },
        });

        return this.toResponseDto(subscription);
    }

    /**
     * Récupère la souscription d'un utilisateur
     */
    async findByUserId(userId: number): Promise<SubscriptionResponseDto | null> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            return null;
        }

        return this.toResponseDto(subscription);
    }

    /**
     * Récupère toutes les souscriptions (admin)
     */
    async findAll(): Promise<SubscriptionResponseDto[]> {
        const subscriptions = await this.prisma.subscription.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return subscriptions.map(sub => this.toResponseDto(sub));
    }

    /**
     * Met à jour une souscription
     */
    async update(userId: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<SubscriptionResponseDto> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            throw new NotFoundException(`Subscription not found for user ${userId}`);
        }

        const updated = await this.prisma.subscription.update({
            where: { userId },
            data: {
                ...updateSubscriptionDto,
                startDate: updateSubscriptionDto.startDate ? new Date(updateSubscriptionDto.startDate) : undefined,
                endDate: updateSubscriptionDto.endDate ? new Date(updateSubscriptionDto.endDate) : undefined,
                trialStartDate: updateSubscriptionDto.trialStartDate ? new Date(updateSubscriptionDto.trialStartDate) : undefined,
                trialEndDate: updateSubscriptionDto.trialEndDate ? new Date(updateSubscriptionDto.trialEndDate) : undefined,
                cancelledAt: updateSubscriptionDto.cancelledAt ? new Date(updateSubscriptionDto.cancelledAt) : undefined,
            },
        });

        return this.toResponseDto(updated);
    }

    /**
     * Annule une souscription
     */
    async cancel(userId: number, cancelledBy: string = 'user'): Promise<SubscriptionResponseDto> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            throw new NotFoundException(`Subscription not found for user ${userId}`);
        }

        const updated = await this.prisma.subscription.update({
            where: { userId },
            data: {
                status: PremiumStatus.CANCELLED,
                cancelledAt: new Date(),
                cancelledBy,
                autoRenew: false,
            },
        });

        return this.toResponseDto(updated);
    }

    /**
     * Renouvelle une souscription
     */
    async renew(userId: number, plan?: SubscriptionPlan): Promise<SubscriptionResponseDto> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            throw new NotFoundException(`Subscription not found for user ${userId}`);
        }

        const newPlan = plan || subscription.plan;
        const dates = this.calculateSubscriptionDates(newPlan);

        const updated = await this.prisma.subscription.update({
            where: { userId },
            data: {
                plan: newPlan,
                status: PremiumStatus.ACTIVE,
                startDate: new Date(),
                endDate: dates.endDate,
                nextBillingDate: dates.nextBillingDate,
                lastPaymentDate: new Date(),
                cancelledAt: null,
                cancelledBy: null,
            },
        });

        return this.toResponseDto(updated);
    }

    /**
     * Active un essai gratuit
     */
    async startTrial(userId: number, durationDays: number = 7): Promise<SubscriptionResponseDto> {
        const existingSubscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        const now = new Date();
        const trialEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        if (existingSubscription) {
            // Ne pas permettre un nouvel essai si déjà utilisé
            if (existingSubscription.trialStartDate) {
                throw new BadRequestException('Trial already used');
            }

            const updated = await this.prisma.subscription.update({
                where: { userId },
                data: {
                    status: PremiumStatus.TRIAL,
                    trialStartDate: now,
                    trialEndDate: trialEnd,
                    startDate: now,
                    endDate: trialEnd,
                },
            });

            return this.toResponseDto(updated);
        }

        // Créer une nouvelle souscription en mode trial
        const subscription = await this.prisma.subscription.create({
            data: {
                userId,
                plan: SubscriptionPlan.FREE,
                status: PremiumStatus.TRIAL,
                trialStartDate: now,
                trialEndDate: trialEnd,
                startDate: now,
                endDate: trialEnd,
            },
        });

        return this.toResponseDto(subscription);
    }

    /**
     * Vérifie si un utilisateur a un abonnement premium actif
     */
    async isPremium(userId: number): Promise<boolean> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        if (!subscription) {
            return false;
        }

        const entity = new Subscription();
        Object.assign(entity, subscription);

        return entity.isActive();
    }

    /**
     * Vérifie et met à jour le statut des souscriptions expirées (cron job)
     */
    async checkAndUpdateExpiredSubscriptions(): Promise<number> {
        const now = new Date();

        const expiredSubscriptions = await this.prisma.subscription.findMany({
            where: {
                OR: [
                    {
                        status: PremiumStatus.ACTIVE,
                        endDate: { lt: now },
                    },
                    {
                        status: PremiumStatus.TRIAL,
                        trialEndDate: { lt: now },
                    },
                ],
            },
        });

        if (expiredSubscriptions.length === 0) {
            return 0;
        }

        await this.prisma.subscription.updateMany({
            where: {
                id: { in: expiredSubscriptions.map(s => s.id) },
            },
            data: {
                status: PremiumStatus.EXPIRED,
            },
        });

        return expiredSubscriptions.length;
    }

    /**
     * Calcule les dates de souscription selon le plan
     * Utilise les vraies dates de mois pour éviter les décalages
     */
    private calculateSubscriptionDates(plan: SubscriptionPlan): {
        startDate: Date;
        endDate: Date | null;
        nextBillingDate: Date | null;
    } {
        const startDate = new Date();
        let endDate: Date | null = null;
        let nextBillingDate: Date | null = null;

        switch (plan) {
            case SubscriptionPlan.MONTHLY:
                // Utiliser la méthode setMonth pour gérer correctement les différentes longueurs de mois
                endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
                nextBillingDate = new Date(endDate);
                break;
            case SubscriptionPlan.YEARLY:
                // Ajouter 1 an à la date actuelle
                endDate = new Date(startDate);
                endDate.setFullYear(endDate.getFullYear() + 1);
                nextBillingDate = new Date(endDate);
                break;
            case SubscriptionPlan.LIFETIME:
                // Pas de date de fin pour lifetime
                endDate = null;
                nextBillingDate = null;
                break;
            case SubscriptionPlan.FREE:
            default:
                endDate = null;
                nextBillingDate = null;
                break;
        }

        return { startDate, endDate, nextBillingDate };
    }

    /**
     * Convertit une entité Subscription en DTO de réponse
     */
    private toResponseDto(subscription: any): SubscriptionResponseDto {
        const entity = new Subscription();
        Object.assign(entity, subscription);

        return new SubscriptionResponseDto({
            id: subscription.id,
            userId: subscription.userId,
            plan: subscription.plan,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            trialStartDate: subscription.trialStartDate,
            trialEndDate: subscription.trialEndDate,
            autoRenew: subscription.autoRenew,
            externalPaymentId: subscription.externalPaymentId,
            isPremium: entity.isPremium(),
            isActive: entity.isActive(),
            isTrial: entity.isTrial(),
            daysRemaining: entity.daysRemaining(),
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
        });
    }
}
