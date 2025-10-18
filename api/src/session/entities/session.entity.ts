import { ExerciceSession, TrainingProgram } from '@prisma/client';

export class TrainingSessionEntity {
  id: number;
  programId: number;
  date: Date;
  duration?: number;
  notes?: string;
  exercices?: ExerciceSession[];
  trainingProgram?: TrainingProgram;
  createdAt?: Date;
  updatedAt?: Date;
}
