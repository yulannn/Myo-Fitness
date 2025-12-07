import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionPlan } from '@prisma/client';
import { AdminGuard } from '../guards/admin.guard';

@Controller('api/v1/subscription')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    /**
     * Récupère la souscription de l'utilisateur connecté
     */
    @Get('me')
    async getMySubscription(@Request() req): Promise<SubscriptionResponseDto | null> {
        return this.subscriptionService.findByUserId(req.user.userId);
    }

    /**
     * Vérifie si l'utilisateur a un abonnement premium
     */
    @Get('me/is-premium')
    async checkPremium(@Request() req): Promise<{ isPremium: boolean }> {
        const isPremium = await this.subscriptionService.isPremium(req.user.userId);
        return { isPremium };
    }

    /**
     * Crée une nouvelle souscription pour l'utilisateur connecté
     */
    @Post()
    async create(
        @Request() req,
        @Body() createSubscriptionDto: CreateSubscriptionDto,
    ): Promise<SubscriptionResponseDto> {
        return this.subscriptionService.create(req.user.userId, createSubscriptionDto);
    }

    /**
     * Met à jour la souscription de l'utilisateur connecté
     */
    @Put()
    async update(
        @Request() req,
        @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    ): Promise<SubscriptionResponseDto> {
        return this.subscriptionService.update(req.user.userId, updateSubscriptionDto);
    }

    /**
     * Annule la souscription de l'utilisateur connecté
     */
    @Delete('cancel')
    async cancel(@Request() req): Promise<SubscriptionResponseDto> {
        return this.subscriptionService.cancel(req.user.userId, 'user');
    }

    /**
     * Renouvelle la souscription de l'utilisateur connecté
     */
    @Post('renew')
    async renew(
        @Request() req,
        @Body('plan') plan?: SubscriptionPlan,
    ): Promise<SubscriptionResponseDto> {
        return this.subscriptionService.renew(req.user.userId, plan);
    }

    /**
     * Démarre un essai gratuit pour l'utilisateur connecté
     */
    @Post('trial')
    async startTrial(
        @Request() req,
        @Body('durationDays') durationDays: number = 7,
    ): Promise<SubscriptionResponseDto> {
        return this.subscriptionService.startTrial(req.user.userId, durationDays);
    }

    /**
     * Routes administrateur (à protéger avec un AdminGuard)
     */

    /**
     * Récupère toutes les souscriptions (admin)
     */
    @Get('all')
    @UseGuards(AdminGuard)
    async findAll(): Promise<SubscriptionResponseDto[]> {
        return this.subscriptionService.findAll();
    }

    /**
     * Récupère la souscription d'un utilisateur spécifique (admin)
     */
    @Get('user/:userId')
    @UseGuards(AdminGuard)
    async findByUserId(@Param('userId') userId: string): Promise<SubscriptionResponseDto | null> {
        return this.subscriptionService.findByUserId(+userId);
    }

    /**
     * Met à jour la souscription d'un utilisateur spécifique (admin)
     */
    @Put('user/:userId')
    @UseGuards(AdminGuard)
    async updateUserSubscription(
        @Param('userId') userId: string,
        @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    ): Promise<SubscriptionResponseDto> {
        return this.subscriptionService.update(+userId, updateSubscriptionDto);
    }

    /**
     * Annule la souscription d'un utilisateur spécifique (admin)
     */
    @Delete('user/:userId/cancel')
    @UseGuards(AdminGuard)
    async cancelUserSubscription(@Param('userId') userId: string): Promise<SubscriptionResponseDto> {
        return this.subscriptionService.cancel(+userId, 'admin');
    }
}
