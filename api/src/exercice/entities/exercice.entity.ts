import { $Enums, Exercice } from '@prisma/client';

export class ExerciceEntity implements Exercice {
  id: number;
  name: string;
  difficulty: number;
  description: string | null;
  type: $Enums.ExerciceType | null;
  isDefault: boolean;
  createdByUserId: number | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ExerciceEntity>) {
    Object.assign(this, partial);
  }
}
