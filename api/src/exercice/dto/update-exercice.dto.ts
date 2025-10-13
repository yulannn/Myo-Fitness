import { PartialType } from '@nestjs/mapped-types';
import { CreateExerciceDto } from './create-exercice.dto';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateExerciceDto extends PartialType(CreateExerciceDto) {
  @IsOptional()
  @IsInt({ message: 'La difficulté doit être un entier.' })
  @Min(1)
  @Max(5)
  difficulty?: number;
}
