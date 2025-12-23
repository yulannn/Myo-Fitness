import { IsOptional, IsDateString } from 'class-validator';

export class ScheduleSessionDto {
  @IsOptional()
  @IsDateString()
  date?: string; // null = maintenant, sinon = date future
}
