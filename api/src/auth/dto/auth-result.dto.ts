import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResultDto {
  @ApiProperty({
    description: 'Jeton d’accès JWT pour les requêtes authentifiées',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiPropertyOptional({
    description: 'Jeton de rafraîchissement (facultatif)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh... (facultatif)',
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Informations de l’utilisateur connecté',
    example: {
      id: 1,
      email: 'jean.dupont@example.com',
      name: 'Jean Dupont',
    },
  })
  user: {
    id: number;
    email: string;
    name: string;
    profilePictureUrl?: string | null;
  };
}
