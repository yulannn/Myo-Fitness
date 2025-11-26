import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

// --- Exercices ---
export class ExerciseDataDto {
    @ApiProperty({ example: 1, description: 'ID de l’exercice existant' })
    @IsNumber()
    id: number;

    @ApiProperty({ example: 3, description: 'Nombre de séries', required: false })
    @IsOptional()
    @IsNumber()
    sets?: number;

    @ApiProperty({
        example: 10,
        description: 'Nombre de répétitions',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    reps?: number;

    @ApiProperty({
        example: 50,
        description: 'Poids utilisé pour l’exercice',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    weight?: number;
}

// --- Sessions ---
export class SessionDataDto {
    @ApiProperty({ example: 'Jour 1 - Haut du corps', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        type: [ExerciseDataDto],
        description: 'Liste des exercices de la séance (objets ou IDs)',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExerciseDataDto)
    exercises: ExerciseDataDto[];
}

// --- Programme ---
export class CreateProgramDataDto {
    @ApiProperty({ example: 'Full Body Débutant' })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Programme complet pour débutants, 3 jours/semaine',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 1, description: 'ID du profil fitness associé' })
    @IsNumber()
    fitnessProfileId: number;
}

// --- DTO combiné ---
export class CreateManualProgramDto {
    @ApiProperty({ type: CreateProgramDataDto })
    @ValidateNested()
    @Type(() => CreateProgramDataDto)
    createProgramDto: CreateProgramDataDto;

    @ApiProperty({
        type: [SessionDataDto],
        description: 'Liste des séances du programme'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SessionDataDto)
    sessions: SessionDataDto[];
}
