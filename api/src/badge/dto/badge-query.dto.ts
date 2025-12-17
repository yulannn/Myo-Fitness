import { IsString, IsEnum, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { BadgeCategory, BadgeTier } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BadgeQueryDto {
  @ApiProperty({ required: false, enum: BadgeCategory })
  @IsOptional()
  @IsEnum(BadgeCategory)
  category?: BadgeCategory;

  @ApiProperty({ required: false, enum: BadgeTier })
  @IsOptional()
  @IsEnum(BadgeTier)
  tier?: BadgeTier;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  onlyUnlocked?: boolean;
}

export class PinBadgeDto {
  @ApiProperty({ description: 'IDs des badges à épingler sur le profil', type: [Number] })
  @IsInt({ each: true })
  badgeIds: number[];
}
