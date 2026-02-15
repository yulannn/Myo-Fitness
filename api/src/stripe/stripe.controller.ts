import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StripeService } from './stripe.service';
import { Throttle } from '@nestjs/throttler';

@Controller('api/v1/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * Crée une session de paiement Stripe Checkout
   * Rate limited à 3 requêtes par minute pour prévenir les abus
   */
  @Post('create-checkout-session')
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requêtes par minute
  async createCheckoutSession(
    @Request() req,
    @Body('plan') plan: 'monthly' | 'yearly',
  ) {
    if (!plan || (plan !== 'monthly' && plan !== 'yearly')) {
      throw new BadRequestException(
        `Plan must be either "monthly" or "yearly". Received: ${plan} (type: ${typeof plan})`,
      );
    }

    const session = await this.stripeService.createCheckoutSession(
      req.user.userId,
      plan,
    );

    return session;
  }

  /**
   * Vérifie le statut d'une session après redirection
   */
  @Get('verify-session')
  @UseGuards(AuthGuard('jwt'))
  async verifySession(@Query('session_id') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('session_id is required');
    }

    return await this.stripeService.verifyCheckoutSession(sessionId);
  }

  /**
   * Annule l'abonnement (à la fin de la période)
   */
  @Post('cancel-subscription')
  @UseGuards(AuthGuard('jwt'))
  async cancelSubscription(@Request() req) {
    return await this.stripeService.cancelSubscription(req.user.userId);
  }

  /**
   * Webhook endpoint pour recevoir les événements Stripe
   * ⚠️ Important: Ce endpoint doit recevoir le raw body
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    await this.stripeService.handleWebhook(req.rawBody!, signature);

    return { received: true };
  }
}
