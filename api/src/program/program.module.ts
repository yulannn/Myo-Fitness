import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { IaService } from 'src/ia/ia.service';

@Module({
  controllers: [ProgramController],
  providers: [ProgramService, IaService],

})
export class ProgramModule { }
