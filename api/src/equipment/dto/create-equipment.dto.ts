import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @ApiProperty({
    description: 'Nom de l’équipement',
    example: 'Haltère',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description de l’équipement (facultatif)',
    example: 'Haltère de 20kg',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
