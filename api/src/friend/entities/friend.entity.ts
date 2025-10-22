import * as client from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { User } from '@prisma/client';

export class FriendEntity {
  @ApiProperty({ description: 'ID de la relation', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID de l’utilisateur qui envoie la demande', example: 2 })
  userId: number;

  @ApiProperty({ description: 'ID de l’ami', example: 3 })
  friendId: number;

  @ApiProperty({ description: 'Statut de la demande d’amitié', enum: client.FriendStatus, example: client.FriendStatus.PENDING })
  status: client.FriendStatus;

  @ApiProperty({ description: 'Date de création de la relation', example: '2025-10-22T12:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Informations sur l’utilisateur', type: () => Object })
  user?: User;

  @ApiPropertyOptional({ description: 'Informations sur l’ami', type: () => Object })
  friend?: User;

  constructor(partial: Partial<FriendEntity>) {
    Object.assign(this, partial);
  }
}
