import type { User } from '@prisma/client';
import { GroupStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupEntity {
  @ApiProperty({ description: 'ID du groupe', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nom du groupe', example: 'Fitness Buddies' })
  name: string;

  @ApiProperty({
    description: 'Date de création du groupe',
    example: '2025-11-13T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Statut du groupe',
    enum: GroupStatus,
    example: GroupStatus.PENDING,
  })
  status: GroupStatus;
  @ApiPropertyOptional({ description: 'Membres du groupe', type: Object, isArray: true })
  members?: User[];

  constructor(partial: Partial<GroupEntity>) {
    Object.assign(this, partial);
  }
}
