import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FitnessProfileModule } from './fitness-profile/fitness-profile.module';
import { ExerciceModule } from './exercice/exercice.module';
import { EquipmentModule } from './equipment/equipment.module';
import { FriendModule } from './friend/friend.module';
import { ProgramModule } from './program/program.module';
import { SessionModule } from './session/session.module';
import { GroupModule } from './group/group.module';
import { PerformanceModule } from './performance/performance.module';
import { RateLimiterGuard } from '../src/guards/rateLimiterGuard'
import { SessionAdaptationModule } from './session-adaptation/session-adaptation.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SessionPhotoModule } from './session-photo/session-photo.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 1000,
        },
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    FitnessProfileModule,
    ExerciceModule,
    EquipmentModule,
    FriendModule,
    ProgramModule,
    SessionModule,
    PerformanceModule,
    SessionAdaptationModule,
    GroupModule,
    SessionPhotoModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule { }
