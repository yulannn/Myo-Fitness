import { Exercice, ExerciceType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExerciceEntity implements Exercice {
  @ApiProperty({
    description: 'Identifiant unique de l’exercice',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom de l’exercice',
    example: 'Pompes',
  })
  name: string;

  @ApiProperty({
    description: 'Difficulté de l’exercice (1 à 5)',
    example: 3,
  })
  difficulty: number;

  @ApiPropertyOptional({
    description: 'Description détaillée de l’exercice',
    example: 'Exercice classique pour le haut du corps',
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Type d’exercice (Enum)',
    example: ExerciceType.STRETCH,
  })
  type: ExerciceType | null;

  @ApiPropertyOptional({
    description: "URL de l'image illustrant l’exercice",
    example: 'https://example.com/images/push-up.png',
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Indique si l’exercice nécessite du matériel',
    example: true,
  })
  Materials: boolean;

  @ApiProperty({
    description: 'Indique si l’exercice utilise uniquement le poids du corps',
    example: true,
  })
  bodyWeight: boolean;

  @ApiProperty({
    description: 'Indique si l’exercice est par défaut dans la base',
    example: false,
  })
  isDefault: boolean;

  @ApiPropertyOptional({
    description: 'ID de l’utilisateur qui a créé l’exercice',
    example: 2,
  })
  createdByUserId: number | null;

  @ApiProperty({
    description: 'Date de création de l’exercice',
    example: '2025-10-22T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour de l’exercice',
    example: '2025-10-22T12:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<ExerciceEntity>) {
    Object.assign(this, partial);
  }
}
