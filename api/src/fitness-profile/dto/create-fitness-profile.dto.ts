import { IsInt, IsNumber, IsEnum, IsBoolean, IsArray, ArrayNotEmpty, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, Goal, ExperienceLevel, WeekDay } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFitnessProfileDto {
  @ApiProperty({
    description: 'Âge de l’utilisateur',
    example: 28,
  })
  @IsInt()
  @Type(() => Number)
  age: number;

  @ApiProperty({
    description: 'Taille en cm',
    example: 175,
    minimum: 100,
    maximum: 250,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(100)
  @Max(250)
  height: number;

  @ApiProperty({
    description: 'Poids en kg',
    example: 70,
    minimum: 30,
    maximum: 250,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(30)
  @Max(250)
  weight: number;

  @ApiProperty({
    description: 'Nombre de séances par semaine',
    example: 4,
    minimum: 1,
    maximum: 7,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(7)
  trainingFrequency: number;

  @ApiProperty({
    description: 'Niveau d’expérience',
    enum: ExperienceLevel,
    example: ExperienceLevel.INTERMEDIATE,
  })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    description: 'Objectifs de l’utilisateur',
    enum: Goal,
    isArray: true,
    example: [Goal.MUSCLE_GAIN, Goal.WEIGHT_LOSS],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Goal, { each: true })
  goals: Goal[];

  @ApiProperty({
    description: 'Genre de l’utilisateur',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Indique si l’utilisateur souhaite uniquement des exercices au poids du corps',
    example: true,
  })
  @IsBoolean()
  bodyWeight: boolean;

  @ApiPropertyOptional({
    description: 'Jours de la semaine pour les entraînements (tableau vide = planification manuelle)',
    enum: WeekDay,
    isArray: true,
    example: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY],
  })
  @IsArray()
  @IsEnum(WeekDay, { each: true })
  @IsOptional()
  trainingDays?: WeekDay[];
}
