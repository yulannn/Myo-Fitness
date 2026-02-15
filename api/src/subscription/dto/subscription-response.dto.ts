import { PremiumStatus, SubscriptionPlan } from '@prisma/client';

export class SubscriptionResponseDto {
  id: number;
  userId: number;
  plan: SubscriptionPlan;
  status: PremiumStatus;

  startDate: Date | null;
  endDate: Date | null;
  trialStartDate: Date | null;
  trialEndDate: Date | null;

  autoRenew: boolean;
  externalPaymentId?: string | null;

  // Informations calculées
  isPremium: boolean;
  isActive: boolean;
  isTrial: boolean;
  daysRemaining: number | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<SubscriptionResponseDto>) {
    Object.assign(this, partial);
  }
}
