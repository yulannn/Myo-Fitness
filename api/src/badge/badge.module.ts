import { Module } from '@nestjs/common';
import { BadgeController } from './badge.controller';
import { BadgeService } from './badge.service';
import { BadgeCheckerService } from './badge-checker.service';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [BadgeController],
  providers: [BadgeService, BadgeCheckerService],
  exports: [BadgeService, BadgeCheckerService],
})
export class BadgeModule { }
