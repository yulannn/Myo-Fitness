import { User, TrainingSession } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SessionPhotoEntity {
  @ApiProperty({ example: 1, description: 'ID de la photo de séance' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID de la séance associée' })
  sessionId: number;

  @ApiProperty({
    example: 1,
    description: 'ID de l’utilisateur qui a posté la photo',
  })
  userId: number;

  @ApiProperty({
    example: 'https://example.com/photos/session123.jpg',
    description: 'URL de la photo',
  })
  photoUrl: string;

  @ApiProperty({
    example: 'Début de séance, prêt à crush !',
    description: 'Description ou commentaire',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '2025-11-13T10:00:00.000Z',
    description: 'Date de création de la photo',
  })
  createdAt: Date;

  session?: TrainingSession;
  user?: User;

  constructor(partial: Partial<SessionPhotoEntity>) {
    Object.assign(this, partial);
  }
}
