import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingSessionDto } from '../dto/create-session.dto';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class UpdateTrainingSessionDto extends PartialType(
  CreateTrainingSessionDto,
) {}

export class UpdateSessionDateDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;
}
