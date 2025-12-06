import { IsEnum, IsOptional, IsBoolean, IsDateString, IsString } from 'class-validator';
import { PremiumStatus, SubscriptionPlan } from '@prisma/client';

export class CreateSubscriptionDto {
    @IsEnum(SubscriptionPlan)
    plan: SubscriptionPlan;

    @IsEnum(PremiumStatus)
    @IsOptional()
    status?: PremiumStatus;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsDateString()
    @IsOptional()
    trialStartDate?: string;

    @IsDateString()
    @IsOptional()
    trialEndDate?: string;

    @IsBoolean()
    @IsOptional()
    autoRenew?: boolean;

    @IsString()
    @IsOptional()
    paymentProvider?: string;

    @IsString()
    @IsOptional()
    externalPaymentId?: string;
}
