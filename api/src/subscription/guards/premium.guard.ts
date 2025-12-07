import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../subscription.service';

/**
 * Guard pour vérifier si l'utilisateur a un abonnement premium actif
 * Utilisation: @UseGuards(JwtAuthGuard, PremiumGuard)
 */
@Injectable()
export class PremiumGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private subscriptionService: SubscriptionService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.userId) {
            throw new ForbiddenException('User not authenticated');
        }

        const isPremium = await this.subscriptionService.isPremium(user.userId);

        if (!isPremium) {
            throw new ForbiddenException('This feature requires a premium subscription');
        }

        return true;
    }
}
