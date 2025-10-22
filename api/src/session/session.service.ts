import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTrainingSessionDto } from './dto/create-session.dto';
import { UpdateSessionDateDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  create(createSessionDto: CreateTrainingSessionDto) {
    return this.prisma.trainingSession.create({
      data: createSessionDto,
    });
  }

  findAll() {
    return this.prisma.trainingSession.findMany({
      include: { exercices: true },
    });
  }

  findOne(id: number) {
    return this.prisma.trainingSession.findUnique({
      where: { id },
      include: { exercices: true },
    });
  }

  async updateDate(id: number, updateSessionDateDto: UpdateSessionDateDto) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return this.prisma.trainingSession.update({
      where: { id },
      data: { date: new Date(updateSessionDateDto.date) },
    });
  }

  remove(id: number) {
    return this.prisma.trainingSession.delete({ where: { id } });
  }
}
