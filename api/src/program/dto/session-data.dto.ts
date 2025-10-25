export class ExerciseDataDto {
  id: number;
  sets?: number;
  reps?: number;
}

export class SessionDataDto {
  name?: string;
  exercises?: (number | ExerciseDataDto)[];
}

export class SessionDataWrapperDto {
  sessions: SessionDataDto[];
}
