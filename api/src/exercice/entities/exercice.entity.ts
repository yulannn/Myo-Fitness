import { Exercice } from '@prisma/client';

export class ExerciceEntity implements Exercice {
  id: number;
  name: string;
  difficulty: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ExerciceEntity>) {
    Object.assign(this, partial);
  }
}
