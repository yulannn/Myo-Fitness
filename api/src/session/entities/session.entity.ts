import type { ExerciceSession, TrainingProgram } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrainingSessionEntity {
  @ApiProperty({ description: 'ID de la séance', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID du programme associé', example: 1 })
  programId: number;

  @ApiProperty({
    description: 'Date et heure de la séance',
    example: '2025-10-22T15:00:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Date et heure de la séance',
    example: '2025-10-22T15:00:00.000Z',
  })
  performedAt: Date;

  @ApiPropertyOptional({
    description: 'Durée de la séance en minutes',
    example: 60,
  })
  duration?: number;

  @ApiPropertyOptional({
    description: 'Nom de la séance',
    example: 'Seance Jambes',
  })
  sessionName?: string;

  @ApiPropertyOptional({
    description: 'Liste des exercices de la séance',
    type: [Object],
  })
  exercices?: ExerciceSession[];

  @ApiPropertyOptional({ description: 'Programme associé', type: Object })
  trainingProgram?: TrainingProgram;

  @ApiPropertyOptional({
    description: 'Date de création',
    example: '2025-10-22T12:00:00.000Z',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Date de dernière mise à jour',
    example: '2025-10-22T12:00:00.000Z',
  })
  updatedAt?: Date;
}
