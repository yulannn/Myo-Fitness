import { Injectable } from '@nestjs/common';
import { CreateExerciceDto } from './dto/create-exercice.dto';
import { UpdateExerciceDto } from './dto/update-exercice.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ExerciceEntity } from './entities/exercice.entity';

@Injectable()
export class ExerciceService {
  constructor(private prisma: PrismaService) { }

  async create(createExerciceDto: CreateExerciceDto, userId: number): Promise<ExerciceEntity> {
    const { muscleGroupIds, equipmentIds, ...exerciceData } = createExerciceDto;

    const exercice = await this.prisma.exercice.create({
      data: {
        ...exerciceData,
        isDefault: false,
        createdByUserId: userId,
        groupes: {
          create: muscleGroupIds?.map((groupeId) => ({ groupeId })) || [],
        },
        equipments: {
          create: equipmentIds?.map((equipmentId) => ({
            equipment: { connect: { id: equipmentId } },
          })) || [],
        },

      },
      include: {
        groupes: { include: { groupe: true } },
        equipments: { include: { equipment: true } },
      },
    });

    return exercice;
  }


  async findAll(userId: number): Promise<ExerciceEntity[]> {
    const exercices = await this.prisma.exercice.findMany({
      where: {
        OR: [
          { isDefault: true },
          { createdByUserId: userId },
        ],
      },
      include: { groupes: { include: { groupe: true } }, equipments: true },
    });

    if (!exercices) {
      throw new Error('No exercices found');
    }

    return exercices;
  }

  async findAllMinimal(userId: number): Promise<{ id: number; name: string }[]> {
    const exercices = await this.prisma.exercice.findMany({
      where: {
        OR: [
          { isDefault: true },
          { createdByUserId: userId },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!exercices) {
      throw new Error('No exercices found');
    }

    return exercices;
  }

  async findOne(id: number): Promise<ExerciceEntity> {
    const exercice = await this.prisma.exercice.findUnique({
      where: { id },
      include: { groupes: true, equipments: true },
    });

    if (!exercice) {
      throw new Error(`Exercice with id ${id} not found`);
    }

    return exercice;
  }

  async update(id: number, updateExerciceDto: UpdateExerciceDto): Promise<ExerciceEntity> {
    const { muscleGroupIds, equipmentIds, ...exerciceData } = updateExerciceDto;

    const exercice = await this.prisma.exercice.findUnique({
      where: { id },
      include: { groupes: true, equipments: true },
    });
    if (!exercice) throw new Error(`Exercice with id ${id} not found`);

    if (exercice.isDefault) {
      throw new Error('Cannot modify a default exercice');
    }

    if (muscleGroupIds) {
      await this.prisma.exerciceMuscleGroup.deleteMany({
        where: { exerciceId: id },
      });
      await this.prisma.exerciceMuscleGroup.createMany({
        data: muscleGroupIds.map((groupeId) => ({ exerciceId: id, groupeId })),
      });
    }

    if (equipmentIds) {
      await this.prisma.exerciceEquipment.deleteMany({
        where: { exerciceId: id },
      });
      await this.prisma.exerciceEquipment.createMany({
        data: equipmentIds.map((equipmentId) => ({ exerciceId: id, equipmentId })),
      });
    }

    const updatedExercice = await this.prisma.exercice.update({
      where: { id },
      data: exerciceData,
      include: {
        groupes: { include: { groupe: true } },
        equipments: { include: { equipment: true } },
      },
    });

    return updatedExercice;
  }


  async remove(id: number) {
    const exercice = await this.prisma.exercice.findUnique({
      where: { id },
    });
    if (!exercice) throw new Error(`Exercice with id ${id} not found`);

    if (exercice.isDefault) {
      throw new Error('Cannot delete a default exercice');
    }

    return this.prisma.exercice.delete({
      where: { id },
    });
  }


  async addEquipment(exerciceId: number, equipmentId: number): Promise<ExerciceEntity> {
    try {
      const exercice = await this.prisma.exercice.findUnique({
        where: { id: exerciceId },
        include: { equipments: true },
      });

      if (!exercice) {
        throw new Error('Exercice not found');
      }

      await this.prisma.exerciceEquipment.create({
        data: {
          exerciceId,
          equipmentId,
        },
      });

      return exercice;
    } catch (error) {
      throw new Error('Failed to add equipment to exercice: ' + error.message);
    }
  }
}
