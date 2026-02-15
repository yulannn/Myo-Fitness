import { MuscleGroup, MuscleCategory } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class MuscleGroupEntity implements MuscleGroup {
  @ApiProperty({
    description: 'Identifiant unique du groupe musculaire',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du groupe musculaire',
    example: 'Pectoraux',
  })
  name: string;

  @ApiProperty({
    description: 'Catégorie du groupe musculaire',
    enum: MuscleCategory,
    example: MuscleCategory.CHEST,
  })
  category: MuscleCategory;

  constructor(partial: Partial<MuscleGroupEntity>) {
    Object.assign(this, partial);
  }
}
