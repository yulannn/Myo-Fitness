import { IsEnum, IsInt } from 'class-validator';
import { FriendStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFriendDto {
  @ApiProperty({
    description: 'ID de l’utilisateur que l’on souhaite ajouter en ami',
    example: 3,
  })
  @IsInt()
  friendId: number;

  @ApiPropertyOptional({
    description: 'Statut de la demande d’amitié',
    enum: FriendStatus,
    example: FriendStatus.PENDING,
  })
  @IsEnum(FriendStatus)
  status: FriendStatus = FriendStatus.PENDING;
}
