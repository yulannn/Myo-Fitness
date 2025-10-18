import { IsInt, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class CreateTrainingSessionDto {
  @IsInt()
  programId: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
