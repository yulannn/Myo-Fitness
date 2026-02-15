import { Injectable, NotFoundException } from '@nestjs/common';
import { FriendStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionPhotoDto } from './dto/create-session-photo.dto';

@Injectable()
export class SessionPhotoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateSessionPhotoDto,
    userId: number,
    photoUrl: string,
  ) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: createDto.sessionId },
    });
    if (!session) {
      throw new NotFoundException('La séance n’existe pas');
    }

    const data: any = {
      sessionId: createDto.sessionId,
      userId,
      photoUrl,
      description: createDto.description ?? null,
    };
    return this.prisma.sessionPhoto.create({
      data,
      select: {
        id: true,
        sessionId: true,
        userId: true,
        photoUrl: true,
        createdAt: true,
        description: true,
      },
    });
  }

  async findAll() {
    return this.prisma.sessionPhoto.findMany();
  }

  async findOne(id: number) {
    return this.prisma.sessionPhoto.findUnique({ where: { id } });
  }

  async remove(id: number) {
    return this.prisma.sessionPhoto.delete({ where: { id } });
  }

  async findByDay(date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.prisma.sessionPhoto.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findToday() {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return this.prisma.sessionPhoto.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findTodayFromFriends(userId: number) {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const friends = await this.prisma.friend.findMany({
      where: {
        status: FriendStatus.ACCEPTED,
        OR: [{ userId }, { friendId: userId }],
      },
      select: {
        userId: true,
        friendId: true,
      },
    });

    if (!friends.length) {
      return [];
    }

    const friendIds: number[] = Array.from(
      new Set(
        friends.map((relation) =>
          relation.userId === userId ? relation.friendId : relation.userId,
        ),
      ),
    );

    if (!friendIds.length) {
      return [];
    }

    return this.prisma.sessionPhoto.findMany({
      where: {
        userId: { in: friendIds },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
