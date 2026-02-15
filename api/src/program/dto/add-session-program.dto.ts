import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ExerciseDataDto {
  @ApiProperty({ example: 5, description: 'ID de l’exercice existant' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 4, description: 'Nombre de séries', required: false })
  @IsOptional()
  @IsNumber()
  sets?: number;

  @ApiProperty({
    example: 20,
    description: 'Nombre de répétitions',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  reps?: number;

  @ApiProperty({ example: 16, description: 'Nombre de poids', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class SessionDataDto {
  @ApiProperty({ example: 'Jour 5 - Abdos & Cardio', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: [ExerciseDataDto],
    description:
      'Liste des exercices de la séance (objets avec id, sets, reps)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDataDto)
  exercises: ExerciseDataDto[];
}

export class AddSessionToProgramDto {
  @ApiProperty({
    type: SessionDataDto,
    description: 'Données de la session à ajouter',
  })
  @ValidateNested()
  @Type(() => SessionDataDto)
  sessionData: SessionDataDto;
}
