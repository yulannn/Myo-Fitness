import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { SharedSessionModule } from './shared-session/shared-session.module';
import { R2Module } from './r2/r2.module';
import { R2UrlInterceptor } from './r2/r2-url.interceptor';
import { EmailModule } from './email/email.module';
import { DateSerializationInterceptor } from './common/interceptors/date-serialization.interceptor';
import { SubscriptionModule } from './subscription/subscription.module';
import { StripeModule } from './stripe/stripe.module';
import { LoggerModule } from './logger/logger.module';
import { SentryTestController } from './config/sentry-test.controller';
import { ActivityModule } from './social/activity/activity.module';
import { BadgeModule } from './badge/badge.module';
import { BodyAtlasModule } from './body-atlas/body-atlas.module';
import { MuscleGroupModule } from './muscle-group/muscle-group.module';
import { SessionTemplateModule } from './session-template/session-template.module';


@Module({
  imports: [
    // Logger en premier pour capturer tous les logs de l'application
    LoggerModule,

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
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
    SharedSessionModule,
    R2Module,
    EmailModule,
    SubscriptionModule,
    StripeModule,
    ActivityModule,
    BadgeModule,
    BodyAtlasModule,
    MuscleGroupModule,
    SessionTemplateModule,
  ],
  controllers: [AppController, SentryTestController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: R2UrlInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DateSerializationInterceptor,
    },
  ],
})
export class AppModule { }
