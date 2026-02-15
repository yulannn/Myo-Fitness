import {
  IsEnum,
  IsOptional,
  IsInt,
  IsArray,
  IsString,
  Min,
} from 'class-validator';
import { ConversationType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ enum: ConversationType })
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  groupId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: [Number],
    description: 'User IDs to add as participants',
  })
  @IsArray()
  @IsInt({ each: true })
  participantIds: number[];
}
