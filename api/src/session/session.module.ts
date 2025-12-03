import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ProgramModule } from 'src/program/program.module';
import { LevelModule } from 'src/level/level.module';

@Module({
  imports: [ProgramModule, LevelModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule { }
