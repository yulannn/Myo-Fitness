import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { PrismaService } from 'prisma/prisma.service';
import { error } from 'console';

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) { }
  async create(createPerformanceDto: CreatePerformanceDto) {
    const exerciceSession = await this.prisma.exerciceSession.findUnique({
      where: { id: createPerformanceDto.exerciceSessionId },
    });

    if (!exerciceSession) {
      throw new Error('Exercice session not found');
    }

    const lastSet = await this.prisma.setPerformance.findFirst({
      where: { id_exercice_session: exerciceSession.id },
      orderBy: { set_index: 'desc' },
    });


    var success = true
    if (createPerformanceDto.reps_effectuees ?? 0 <= exerciceSession.reps) {
      success = false;
    }

    const setIndex = lastSet ? lastSet.set_index + 1 : 1;

    const performance = await this.prisma.setPerformance.create({
      data: {
        exerciceSession: {
          connect: { id: createPerformanceDto.exerciceSessionId },
        },
        set_index: setIndex,
        reps_effectuees: createPerformanceDto.reps_effectuees,
        reps_prevues: exerciceSession.reps,
        weight: createPerformanceDto.weight,
        rpe: createPerformanceDto.rpe,
        success: success,
      },
    });
    return performance;
  }


  async findOne(id: number) {
    const performance = await this.prisma.setPerformance.findUnique({
      where: { id_set: id }
    });
    if (!performance) {
      throw new error(`Performance #${id} not found`)
    }
  }

  async findAllPerformanceByUser(userId: number) {
    const performances = await this.prisma.setPerformance.findMany({
      where: {
        exerciceSession: {
          trainingSession: {
            trainingProgram: {
              fitnessProfile: {
                userId: userId,
              },
            },
          },
        },
      },
      include: {
        exerciceSession: {
          include: {
            exercice: true,
          },
        },
      },
    });
    return performances;
  }

  async update(id: number, updatePerformanceDto: UpdatePerformanceDto) {
    const existing = await this.prisma.setPerformance.findUnique({
      where: { id_set: id },
    });

    if (!existing) {
      throw new NotFoundException(`Performance #${id} not found`);
    }

    const updated = await this.prisma.setPerformance.update({
      where: { id_set: id },
      data: {
        reps_effectuees: updatePerformanceDto.reps_effectuees ?? existing.reps_effectuees,
        weight: updatePerformanceDto.weight ?? existing.weight,
        rpe: updatePerformanceDto.rpe ?? existing.rpe,
        success:
          updatePerformanceDto.reps_effectuees !== undefined
            ? updatePerformanceDto.reps_effectuees > (existing.reps_prevues ?? 0)
            : existing.success,
      },
    });

    return updated;
  }

  async remove(id: number) {
    const existing = await this.prisma.setPerformance.findUnique({
      where: { id_set: id },
    });

    if (!existing) {
      throw new NotFoundException(`Performance #${id} not found`);
    }

    await this.prisma.setPerformance.delete({
      where: { id_set: id },
    });

    return { message: `Performance #${id} supprimée avec succès` };
  }
}
