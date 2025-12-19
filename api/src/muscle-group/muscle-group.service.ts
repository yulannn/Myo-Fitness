import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MuscleGroupEntity } from './entities/muscle-group.entity';

@Injectable()
export class MuscleGroupService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<MuscleGroupEntity[]> {
        const muscleGroups = await this.prisma.muscleGroup.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        });

        return muscleGroups.map((group) => new MuscleGroupEntity(group));
    }
}
