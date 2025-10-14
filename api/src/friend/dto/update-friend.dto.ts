import { IsEnum, IsOptional } from 'class-validator';
import { FriendStatus } from '@prisma/client';

export class UpdateFriendDto {
  @IsOptional()
  @IsEnum(FriendStatus)
  status?: FriendStatus;
}
