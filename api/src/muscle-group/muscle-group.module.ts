import { Module } from '@nestjs/common';
import { MuscleGroupController } from './muscle-group.controller';
import { MuscleGroupService } from './muscle-group.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MuscleGroupController],
    providers: [MuscleGroupService],
    exports: [MuscleGroupService],
})
export class MuscleGroupModule { }
