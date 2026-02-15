import { Injectable } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { PrismaService } from 'prisma/prisma.service';
import { EquipmentEntity } from './entities/equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createEquipmentDto: CreateEquipmentDto,
  ): Promise<EquipmentEntity> {
    try {
      const equipment = await this.prisma.equipment.create({
        data: createEquipmentDto,
      });
      return equipment;
    } catch (error) {
      throw new Error('Failed to create equipment: ' + error.message);
    }
  }

  async findAll(): Promise<EquipmentEntity[]> {
    try {
      const equipments = await this.prisma.equipment.findMany();
      return equipments;
    } catch (error) {
      throw new Error('Failed to retrieve equipments: ' + error.message);
    }
  }

  async findOne(id: number): Promise<EquipmentEntity> {
    try {
      const equipment = await this.prisma.equipment.findUnique({
        where: { id },
      });
      if (!equipment) {
        throw new Error('Equipment not found');
      }
      return equipment;
    } catch (error) {
      throw new Error('Failed to retrieve equipment: ' + error.message);
    }
  }

  async update(
    id: number,
    updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<EquipmentEntity> {
    try {
      const equipment = await this.prisma.equipment.update({
        where: { id },
        data: updateEquipmentDto,
      });
      return equipment;
    } catch (error) {
      throw new Error('Failed to update equipment: ' + error.message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.equipment.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error('Failed to remove equipment: ' + error.message);
    }
  }
}
