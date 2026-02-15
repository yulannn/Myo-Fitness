import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionCleanupService } from './session-cleanup.service';
import { PrismaModule } from 'prisma/prisma.module';
import { ProgramModule } from '../program/program.module';
import { UsersModule } from 'src/users/users.module';
import { ActivityModule } from '../social/activity/activity.module';
import { BadgeModule } from '../badge/badge.module';
import { BodyAtlasModule } from '../body-atlas/body-atlas.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    PrismaModule,
    ProgramModule,
    UsersModule,
    ActivityModule,
    BadgeModule,
    BodyAtlasModule,
    LeaderboardModule,
  ],
  controllers: [SessionController],
  providers: [SessionService, SessionCleanupService],
  exports: [SessionService],
})
export class SessionModule {}
