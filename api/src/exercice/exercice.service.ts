import { Injectable } from '@nestjs/common';
import { CreateExerciceDto } from './dto/create-exercice.dto';
import { UpdateExerciceDto } from './dto/update-exercice.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ExerciceEntity } from './entities/exercice.entity';

@Injectable()
export class ExerciceService {
  constructor(private prisma: PrismaService) { }

  async create(createExerciceDto: CreateExerciceDto): Promise<ExerciceEntity> {
    const { muscleGroupIds, ...exerciceData } = createExerciceDto;
    const exercice = await this.prisma.exercice.create({
      data: {
        ...exerciceData,
        groupes: {
          create: muscleGroupIds.map((groupeId) => ({ groupeId })),
        },
      },
      include: { groupes: true },
    });
    return exercice;
  }

  async findAll(): Promise<ExerciceEntity[]> {
    const exercices = await this.prisma.exercice.findMany({
      include: { groupes: { include: { groupe: true } } },
    });

    if (!exercices) {
      throw new Error('No exercices found');
    }

    return exercices;
  }

  async findOne(id: number): Promise<ExerciceEntity> {
    const exercice = await this.prisma.exercice.findUnique({
      where: { id },
      include: { groupes: true },
    });

    if (!exercice) {
      throw new Error(`Exercice with id ${id} not found`);
    }

    return exercice;
  }

  async update(id: number, updateExerciceDto: UpdateExerciceDto): Promise<ExerciceEntity> {
    const exercice = await this.prisma.exercice.findUnique({
      where: { id },
      include: { groupes: true },
    });

    if (!exercice) {
      throw new Error(`Exercice with id ${id} not found`);
    }

    if (updateExerciceDto.muscleGroupIds && updateExerciceDto.muscleGroupIds !== exercice.groupes.map(g => g.groupeId)) {
      await this.prisma.exerciceMuscleGroup.deleteMany({
        where: { exerciceId: id },
      });

      await this.prisma.exerciceMuscleGroup.createMany({
        data: updateExerciceDto.muscleGroupIds.map(groupeId => ({
          exerciceId: id,
          groupeId,
        })),
      });
    }

    return await this.prisma.exercice.update({
      where: { id },
      data: updateExerciceDto,
      include: { groupes: true },
    });
  }

  remove(id: number) {
    return this.prisma.exercice.delete({
      where: { id },
    });
  }
}
