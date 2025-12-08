import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ProgramModule } from 'src/program/program.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ProgramModule, UsersModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule { }

