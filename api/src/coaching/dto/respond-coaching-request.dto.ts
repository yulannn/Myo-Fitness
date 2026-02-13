import { IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CoachingStatus } from '@prisma/client';

export class RespondCoachingRequestDto {
  @ApiProperty({
    description: 'ID de la relation de coaching',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  requestId: number;

  @ApiProperty({
    description: 'Nouveau statut (ACCEPTED ou REJECTED)',
    enum: ['ACCEPTED', 'REJECTED'],
    example: 'ACCEPTED',
  })
  @IsEnum(['ACCEPTED', 'REJECTED'])
  @IsNotEmpty()
  status: 'ACCEPTED' | 'REJECTED';
}
