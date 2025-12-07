import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PrismaService } from 'prisma/prisma.service';
import { PremiumGuard } from './guards/premium.guard';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService, PremiumGuard, SubscriptionSchedulerService],
  exports: [SubscriptionService, PremiumGuard],
})
export class SubscriptionModule { }
