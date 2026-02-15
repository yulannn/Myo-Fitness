import {
  IsInt,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePerformanceDto {
  @ApiProperty({
    description: 'ID de l’ExerciceSession auquel appartient la série',
    example: 1,
  })
  @IsInt()
  exerciceSessionId: number;

  @ApiPropertyOptional({
    description: 'Nombre de répétitions effectuées',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  reps_effectuees?: number;

  @ApiPropertyOptional({
    description: 'Poids utilisé pour la série',
    example: 50.5,
  })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({
    description: 'RPE (Rate of Perceived Exertion) de la série',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rpe?: number;
}
