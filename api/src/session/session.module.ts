import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ProgramModule } from 'src/program/program.module';

@Module({
  imports: [ProgramModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule { }
