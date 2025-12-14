import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ProgramModule } from 'src/program/program.module';
import { UsersModule } from 'src/users/users.module';
import { ActivityModule } from '../social/activity/activity.module';

@Module({
  imports: [ProgramModule, UsersModule, ActivityModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule { }

