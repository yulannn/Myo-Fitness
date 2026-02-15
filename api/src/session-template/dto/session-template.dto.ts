import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExerciseTemplateDto {
  @IsInt()
  exerciseId: number;

  @IsInt()
  @Min(1)
  sets: number;

  @IsInt()
  @Min(1)
  reps: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number; // 🆕 Durée en minutes pour exercices cardio

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  orderInSession?: number;
}

export class CreateSessionTemplateDto {
  @IsInt()
  programId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  orderInProgram?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseTemplateDto)
  exercises: ExerciseTemplateDto[];
}

export class UpdateSessionTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseTemplateDto)
  exercises?: ExerciseTemplateDto[];
}
