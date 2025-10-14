import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateExerciceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsInt({ each: true, message: 'Chaque groupe musculaire doit être un entier (id).' })
  muscleGroupIds?: number[];

  @IsArray()
  @IsInt({ each: true, message: 'Chaque équipement doit être un entier (id).' })
  @IsOptional()
  equipmentIds?: number[];
}
