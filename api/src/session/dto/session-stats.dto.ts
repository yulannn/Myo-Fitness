import { ApiProperty } from '@nestjs/swagger';

/**
 * 📊 DTO pour les statistiques utilisateur optimisées
 */
export class UserStatsDto {
  @ApiProperty({
    description: 'Nombre total de sessions',
    example: 42,
  })
  totalSessions: number;

  @ApiProperty({
    description: 'Nombre de sessions complétées',
    example: 35,
  })
  completedSessions: number;

  @ApiProperty({
    description: 'Nombre de sessions à venir (planifiées)',
    example: 7,
  })
  upcomingSessions: number;
}

/**
 * 🏆 DTO pour un record personnel
 */
export class PersonalRecordDto {
  @ApiProperty({
    description: "Nom de l'exercice",
    example: 'Développé couché',
  })
  exerciseName: string;

  @ApiProperty({
    description: "ID de l'exercice",
    example: 5,
  })
  exerciseId: number;

  @ApiProperty({
    description: 'Poids maximal (kg)',
    example: 80,
  })
  weight: number;

  @ApiProperty({
    description: 'Nombre de répétitions',
    example: 8,
  })
  reps: number;

  @ApiProperty({
    description: 'Date de la performance',
    example: '2024-12-20T10:30:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Volume total (poids × reps)',
    example: 640,
  })
  volume: number;
}

/**
 * 🔥 DTO pour les données de streak
 */
export class StreakDataDto {
  @ApiProperty({
    description: 'Série actuelle de jours consécutifs',
    example: 5,
  })
  currentStreak: number;

  @ApiProperty({
    description: 'Record de série la plus longue',
    example: 12,
  })
  longestStreak: number;

  @ApiProperty({
    description: 'Activité des 7 derniers jours',
    type: [Boolean],
    example: [true, false, true, true, true, false, true],
  })
  weekActivity: boolean[];

  @ApiProperty({
    description: 'Nombre total de sessions complétées',
    example: 35,
  })
  totalCompletedSessions: number;
}
