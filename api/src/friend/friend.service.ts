import { Injectable } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FriendService {
  constructor(private prisma: PrismaService) { }

  async sendFriendRequest(createFriendDto: CreateFriendDto, userId: number) {
    const { friendId } = createFriendDto;
    const existingRequest = await this.prisma.friendRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: friendId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new Error('Friend request already sent');
    }

    return this.prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: friendId,
        status: 'PENDING',
      },
    });
  }

  async acceptFriendRequest(requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    await this.prisma.friend.createMany({
      data: [
        { userId: request.senderId, friendId: request.receiverId },
        { userId: request.receiverId, friendId: request.senderId },
      ],
      skipDuplicates: true,
    });

    await this.prisma.friendRequest.delete({
      where: { id: requestId },
    });

    return { message: 'Friend request accepted' };
  }


  async declineFriendRequest(requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    await this.prisma.friendRequest.delete({
      where: { id: requestId },
    });
    return { message: 'Friend request declined' };
  }

  async getPendingFriendRequest(userId: number) {
    const requests = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
    });

    return requests;
  }

  async getFriendsList(userId: number) {
    const friendList = await this.prisma.friend.findMany({
      where: {
        userId: userId
      }
    })

    if (!friendList){
      throw new Error("No friend found")
    }
    return friendList
  }


}
