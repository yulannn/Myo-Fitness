import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserEntity } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }


  async findUserById(id: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(data: { email: string; password: string; name: string }): Promise<UserEntity> {
    const newUser = await this.prisma.user.create({
      data,
    });
    return newUser;
  }

  async updateUser(id: number, data: Partial<UserEntity>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }



}