// src/fitness-profile/dto/create-fitness-profile.dto.ts
import { IsInt, IsNumber, IsEnum, IsBoolean, IsArray, ArrayNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, Goal, ExperienceLevel } from '@prisma/client';

export class CreateFitnessProfileDto {
  @IsInt()
  @Type(() => Number)
  age: number;

  @IsNumber()
  @Type(() => Number)
  @Min(100)
  @Max(250)
  height: number; // en cm

  @IsNumber()
  @Type(() => Number)
  @Min(30)
  @Max(250)
  weight: number; // en kg

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(7)
  trainingFrequency: number; // nb de séances / semaine

  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Goal, { each: true })
  goals: Goal[];

  @IsEnum(Gender)
  gender: Gender;

  @IsBoolean()
  gym: boolean;
}
