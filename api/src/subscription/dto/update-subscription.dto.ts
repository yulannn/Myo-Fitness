import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { PremiumStatus } from '@prisma/client';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
  @IsEnum(PremiumStatus)
  @IsOptional()
  status?: PremiumStatus;

  @IsDateString()
  @IsOptional()
  cancelledAt?: string;

  @IsString()
  @IsOptional()
  cancelledBy?: string;
}
