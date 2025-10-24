import { Module } from '@nestjs/common';
import { ThrottlerModule} from '@nestjs/throttler';
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
import { PerformanceModule } from './performance/performance.module';
import { RateLimiterGuard } from '../src/guards/rateLimiterGuard'

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // --> en ms donc 1min là
          limit: 1000, // --> mettre moins en Prod
        },
      ],
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
export class AppModule {}
