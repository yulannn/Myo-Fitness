import { IsInt, IsEnum, Min, Max } from 'class-validator';

export enum CardioPosition {
  START = 'START',
  END = 'END',
}

export class AddCardioToProgramDto {
  @IsInt()
  exerciseId: number;

  @IsEnum(CardioPosition)
  position: CardioPosition;

  @IsInt()
  @Min(1)
  @Max(180) // Max 3 heures
  duration: number; // En minutes
}
