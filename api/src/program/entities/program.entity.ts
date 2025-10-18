import { Expose, Type } from 'class-transformer';
import { ProgramStatus, ProgramTemplate } from '@prisma/client';
import { TrainingSessionEntity } from '../../session/entities/session.entity';

export class TrainingProgramEntity {
  @Expose()
  id: number;

  @Expose()
  fitnessProfileId: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  template?: ProgramTemplate;

  @Expose()
  status: ProgramStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => TrainingSessionEntity)
  sessions?: TrainingSessionEntity[];
}
