import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionPhotoDto {
  @ApiProperty({ description: 'ID de la séance associée', example: 1 })
  @Type(() => Number)
  @IsInt()
  sessionId: number;

  @ApiProperty({
    description: 'Commentaire facultatif',
    required: false,
    example: 'Début de séance !',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO uniquement pour Swagger
 * Il permet à Swagger d’afficher le champ "photo" (fichier)
 * sans que class-validator ne le valide.
 */
export class CreateSessionPhotoDtoWithFile extends CreateSessionPhotoDto {
  @ApiProperty({
    description: 'Photo de la séance (fichier)',
    type: 'string',
    format: 'binary',
  })
  photo: any;
}
