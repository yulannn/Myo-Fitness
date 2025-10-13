import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FitnessProfileModule } from './fitness-profile/fitness-profile.module';
import { ExerciceModule } from './exercice/exercice.module';
import { EquipmentModule } from './equipment/equipment.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, FitnessProfileModule, ExerciceModule, EquipmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
