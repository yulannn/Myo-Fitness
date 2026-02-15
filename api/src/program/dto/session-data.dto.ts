import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class ExerciseDataDto {
  @ApiProperty({ example: 5, description: "ID de l'exercice existant" })
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

  @ApiProperty({ example: 16, description: 'Poids en kg', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class SessionDataDto {
  name?: string;
  exercises?: (number | ExerciseDataDto)[];
}

export class SessionDataWrapperDto {
  sessions: SessionDataDto[];
}
