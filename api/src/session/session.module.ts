import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { PrismaModule } from 'prisma/prisma.module';
import { ProgramModule } from '../program/program.module';
import { UsersModule } from 'src/users/users.module';
import { ActivityModule } from '../social/activity/activity.module';
import { BadgeModule } from '../badge/badge.module';
import { BodyAtlasModule } from '../body-atlas/body-atlas.module';

@Module({
  imports: [PrismaModule, ProgramModule, UsersModule, ActivityModule, BadgeModule, BodyAtlasModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule { }
