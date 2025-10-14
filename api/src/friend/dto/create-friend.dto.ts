import { IsEnum, IsInt, } from 'class-validator';
import { FriendStatus } from '@prisma/client';

export class CreateFriendDto {

  @IsInt()
  friendId: number;

  @IsEnum(FriendStatus)
  status: FriendStatus = FriendStatus.PENDING;
}
