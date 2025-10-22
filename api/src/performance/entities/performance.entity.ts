import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PerformanceEntity {
  @ApiProperty({ description: 'ID de la performance', example: 1 })
  id_set: number;

  @ApiProperty({ description: 'ID de l’ExerciceSession', example: 1 })
  exerciceSessionId: number;

  @ApiPropertyOptional({ description: 'Répétitions effectuées', example: 10 })
  reps_effectuees?: number;

  @ApiPropertyOptional({ description: 'Répétitions prévues', example: 12 })
  reps_prevues?: number;

  @ApiPropertyOptional({ description: 'Poids utilisé', example: 50.5 })
  weight?: number;

  @ApiPropertyOptional({ description: 'RPE de la série', example: 8, minimum: 1, maximum: 10 })
  rpe?: number;
}
