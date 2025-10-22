import { Equipment } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EquipmentEntity implements Equipment {
  @ApiProperty({
    description: 'Identifiant unique de l’équipement',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom de l’équipement',
    example: 'Haltère',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description de l’équipement (facultatif)',
    example: 'Haltère de 20kg',
  })
  description: string | null;

  @ApiProperty({
    description: 'Date de création de l’équipement',
    example: '2025-10-22T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour de l’équipement',
    example: '2025-10-22T12:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<EquipmentEntity>) {
    Object.assign(this, partial);
  }
}
