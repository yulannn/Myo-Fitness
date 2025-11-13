import { IsInt, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrainingSessionDto {
  @ApiProperty({
    description: 'ID du programme auquel appartient la séance',
    example: 1,
  })
  @IsInt()
  programId: number;

  @ApiProperty({
    description: 'Date et heure de la séance (format ISO 8601)',
    example: '2025-10-22T15:00:00.000Z',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    description: 'Durée de la séance en minutes',
    example: 60,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({
    description: 'Notes ou commentaires sur la séance',
    example: 'Travail sur les jambes, focus squat et fentes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
