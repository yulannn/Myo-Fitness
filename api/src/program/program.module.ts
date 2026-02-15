import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { IaService } from 'src/ia/ia.service';
import { IaModule } from 'src/ia/ia.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [IaModule, SubscriptionModule],
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService],
})
export class ProgramModule {}
