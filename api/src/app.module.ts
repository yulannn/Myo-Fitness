import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FitnessProfileModule } from './fitness-profile/fitness-profile.module';
import { ExerciceModule } from './exercice/exercice.module';
import { EquipmentModule } from './equipment/equipment.module';
import { FriendModule } from './friend/friend.module';
import { IaModule } from './ia/ia.module';
import { ProgramModule } from './program/program.module';
import { SessionModule } from './session/session.module';
import { GroupModule } from './group/group.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, FitnessProfileModule, ExerciceModule, EquipmentModule, FriendModule, IaModule, ProgramModule, SessionModule, GroupModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
