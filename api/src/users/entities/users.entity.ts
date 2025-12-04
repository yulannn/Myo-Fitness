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

  @Exclude()
  password: string;

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

  @ApiPropertyOptional({
    description: 'Refresh token de l\'utilisateur',
    example: null,
  })
  refreshToken?: string | null;

  @Exclude()
  resetPasswordCode?: string | null;

  @Exclude()
  resetPasswordExpires?: Date | null;
}
