import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from '../subscription/subscription.service';

/**
 * Service de tâches planifiées pour la gestion des abonnements
 */
@Injectable()
export class SubscriptionSchedulerService {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);

  constructor(private subscriptionService: SubscriptionService) {}

  /**
   * Vérifie et met à jour les abonnements expirés
   * S'exécute tous les jours à 2h du matin
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleExpiredSubscriptions() {
    this.logger.log('🔄 Starting expired subscriptions check...');

    try {
      const count =
        await this.subscriptionService.checkAndUpdateExpiredSubscriptions();

      if (count > 0) {
        this.logger.log(
          `✅ Successfully marked ${count} subscription(s) as expired`,
        );
      } else {
        this.logger.log('ℹ️  No expired subscriptions found');
      }
    } catch (error) {
      this.logger.error(
        `❌ Error checking expired subscriptions: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Optionnel: Vérification supplémentaire toutes les 6 heures
   * Pour une détection plus rapide des abonnements expirés
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleExpiredSubscriptionsFrequent() {
    this.logger.debug('🔄 Quick check for expired subscriptions...');

    try {
      const count =
        await this.subscriptionService.checkAndUpdateExpiredSubscriptions();

      if (count > 0) {
        this.logger.warn(
          `⚠️  Found ${count} expired subscription(s) in quick check`,
        );
      }
    } catch (error) {
      this.logger.error(`❌ Error in quick check: ${error.message}`);
    }
  }
}
