import { Expose, Type } from 'class-transformer';
import { ProgramStatus, ProgramTemplate } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrainingSessionEntity } from '../../session/entities/session.entity';

export class TrainingProgramEntity {
  @ApiProperty({ description: 'ID du programme', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'ID du profil fitness associé', example: 1 })
  @Expose()
  fitnessProfileId: number;

  @ApiProperty({
    description: 'Nom du programme',
    example: 'Programme Force & Endurance',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Description du programme',
    example: 'Programme de 12 semaines',
  })
  @Expose()
  description: string;

  @ApiPropertyOptional({
    description: 'Template du programme',
    enum: ProgramTemplate,
    example: ProgramTemplate.PUSH_PULL_LEGS,
  })
  @Expose()
  template?: ProgramTemplate;

  @ApiProperty({
    description: 'Statut du programme',
    enum: ProgramStatus,
    example: ProgramStatus.DRAFT,
  })
  @Expose()
  status: ProgramStatus;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-10-22T12:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-10-22T12:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Sessions du programme',
    type: [TrainingSessionEntity],
  })
  @Expose()
  @Type(() => TrainingSessionEntity)
  sessions?: TrainingSessionEntity[];
}
