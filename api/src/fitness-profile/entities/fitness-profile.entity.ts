import { FitnessProfile, Goal, Gender, ExperienceLevel } from '@prisma/client';

export class FitnessProfileEntity implements FitnessProfile {
  id: number;
  userId: number;
  age: number;
  height: number;
  weight: number;
  trainingFrequency: number;
  experienceLevel: ExperienceLevel;
  goals: Goal[];
  gender: Gender;
  gym: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<FitnessProfileEntity>) {
    Object.assign(this, partial);
  }
}
