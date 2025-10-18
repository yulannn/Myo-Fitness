import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingProgramDto } from './create-program.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ProgramStatus } from '@prisma/client';

export class UpdateTrainingProgramDto extends PartialType(CreateTrainingProgramDto) {
  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus;
}
