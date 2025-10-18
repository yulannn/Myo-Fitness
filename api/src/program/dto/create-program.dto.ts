import { IsString, IsOptional, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ProgramTemplate, ProgramStatus } from '@prisma/client';

export class CreateTrainingProgramDto {
  @IsInt()
  @Type(() => Number)
  fitnessProfileId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;


  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus = ProgramStatus.DRAFT;
}
