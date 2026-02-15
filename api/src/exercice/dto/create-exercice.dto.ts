import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExerciceDto {
  @ApiProperty({
    description: 'Nom de l’exercice',
    example: 'Pompes',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Difficulté de l’exercice (1 à 5)',
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number;

  @ApiPropertyOptional({
    description: 'Description détaillée de l’exercice',
    example: 'Exercice classique pour le haut du corps',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Indique si l’exercice utilise uniquement le poids du corps',
    example: true,
  })
  @IsBoolean()
  bodyWeight: boolean;

  @ApiPropertyOptional({
    description: 'Indique si l’exercice nécessite du matériel',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  Materials?: boolean;

  @ApiPropertyOptional({
    description: 'Liste des IDs des groupes musculaires ciblés',
    example: [1, 3, 5],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({
    each: true,
    message: 'Chaque groupe musculaire doit être un entier (id).',
  })
  muscleGroupIds?: number[];

  @ApiPropertyOptional({
    description: 'Liste des IDs des équipements nécessaires',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true, message: 'Chaque équipement doit être un entier (id).' })
  @IsOptional()
  equipmentIds?: number[];
}
