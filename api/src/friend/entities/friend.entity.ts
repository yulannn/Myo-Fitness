import { User, FriendStatus } from '@prisma/client';

export class FriendEntity {
  id: number;
  userId: number;
  friendId: number;
  status: FriendStatus;
  createdAt: Date;
  user?: User;
  friend?: User;

  constructor(partial: Partial<FriendEntity>) {
    Object.assign(this, partial);
  }
}
