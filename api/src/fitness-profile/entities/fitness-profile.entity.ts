import { FitnessProfile, Goal, Gender, ExperienceLevel, WeekDay, TrainingEnvironment } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FitnessProfileEntity implements FitnessProfile {
  @ApiProperty({
    description: 'Identifiant unique du profil fitness',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "ID de l'utilisateur auquel appartient le profil",
    example: 2,
  })
  userId: number;

  @ApiProperty({
    description: "Âge de l'utilisateur",
    example: 28,
  })
  age: number;

  @ApiProperty({
    description: 'Taille en cm',
    example: 175,
  })
  height: number;

  @ApiProperty({
    description: 'Poids en kg',
    example: 70,
  })
  weight: number;

  @ApiPropertyOptional({
    description: "Ville de l'utilisateur",
    example: 'Paris',
  })
  city: string | null;

  @ApiProperty({
    description: 'Nombre de séances par semaine',
    example: 4,
  })
  trainingFrequency: number;

  @ApiProperty({
    description: "Jours de la semaine sur lesquels l'utilisateur effectue ses séances",
    enum: WeekDay,
    isArray: true,
    example: [WeekDay.MONDAY, WeekDay.TUESDAY],
  })
  trainingDays: WeekDay[];

  @ApiProperty({
    description: "Niveau d'expérience de l'utilisateur",
    enum: ExperienceLevel,
    example: ExperienceLevel.INTERMEDIATE,
  })
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    description: "Objectifs de l'utilisateur",
    enum: Goal,
    isArray: true,
    example: [Goal.MUSCLE_GAIN, Goal.WEIGHT_LOSS],
  })
  goals: Goal[];

  @ApiProperty({
    description: "Genre de l'utilisateur",
    enum: Gender,
    example: Gender.MALE,
  })
  gender: Gender;

  @ApiProperty({
    description: "Indique si l'utilisateur souhaite uniquement des exercices au poids du corps",
    example: true,
  })
  bodyWeight: boolean;

  @ApiPropertyOptional({
    description: 'Objectif de poids en kg',
    example: 75,
  })
  targetWeight: number | null;

  @ApiPropertyOptional({
    description: "IDs des groupes musculaires prioritaires (Biceps, Triceps, Fessiers, etc.)",
    type: [Number],
    isArray: true,
    example: [1, 5, 6], // Ex: Pectoraux, Biceps, Triceps
  })
  musclePriorities: number[];

  @ApiProperty({
    description: "Environnement d'entraînement préféré",
    enum: TrainingEnvironment,
    example: TrainingEnvironment.GYM,
  })
  trainingEnvironment: TrainingEnvironment;

  @ApiProperty({
    description: 'Date de création du profil',
    example: '2025-10-22T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour du profil',
    example: '2025-10-22T12:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<FitnessProfileEntity>) {
    Object.assign(this, partial);
  }
}
