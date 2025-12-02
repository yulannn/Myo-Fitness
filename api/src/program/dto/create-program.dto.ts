import { IsString, IsOptional, IsEnum, IsInt, IsNotEmpty, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ProgramStatus, ProgramTemplate } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrainingProgramDto {
  @ApiProperty({
    description: 'ID du profil fitness associé',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  fitnessProfileId: number;

  @ApiProperty({
    description: 'Nom du programme',
    example: 'Programme Force & Endurance',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description du programme',
    example: 'Programme de 12 semaines pour développer force et endurance',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Statut du programme',
    enum: ProgramStatus,
    example: ProgramStatus.ACTIVE,
  })
  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus = ProgramStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Date de début du programme (pour planification auto)',
    example: '2025-12-05T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;
}
