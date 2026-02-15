import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'Adresse e-mail de l’utilisateur',
    example: 'jean.dupont@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nom complet de l’utilisateur',
    example: 'Jean Dupont',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Mot de passe (minimum 6 caractères)',
    example: 'password123',
    minLength: 6,
  })
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: "Rôle de l'utilisateur (USER ou COACH)",
    example: 'USER',
    enum: ['USER', 'COACH'],
  })
  @IsOptional()
  @IsIn(['USER', 'COACH'])
  role?: 'USER' | 'COACH';
}
