import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ description: 'ID de l\'utilisateur', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'jean.dupont@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Nom de l\'utilisateur', example: 'Jean' })
  name: string;

  @ApiPropertyOptional({
    description: 'URL de la photo de profil',
    example: 'https://example.com/profile.jpg',
  })
  profilePictureUrl?: string | null;

  @ApiPropertyOptional({ description: 'Code ami unique', example: 'ABC1234' })
  friendCode?: string | null;

  @Exclude()
  password: string;

  @ApiProperty({
    description: 'Niveau de l\'utilisateur',
    example: 1,
  })
  level: number;

  @ApiProperty({
    description: 'Expérience de l\'utilisateur',
    example: 0,
  })
  xp: number;

  @ApiProperty({
    description: 'Date de création du compte',
    example: '2025-10-22T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-10-22T12:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Version du token pour la révocation (sécurité)',
    example: 0,
  })
  tokenVersion: number;

  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    example: 'USER',
    enum: ['USER', 'COACH'],
  })
  role: 'USER' | 'COACH';

  @ApiPropertyOptional({
    description: 'Refresh token de l\'utilisateur',
    example: null,
  })
  refreshToken?: string | null;

  @Exclude()
  resetPasswordCode?: string | null;

  @Exclude()
  resetPasswordExpires?: Date | null;

  @ApiProperty({
    description: 'Indique si l\'email a été vérifié',
    example: true,
  })
  emailVerified: boolean;

  @Exclude()
  emailVerificationCode?: string | null;

  @Exclude()
  emailVerificationExpires?: Date | null;
}
