import { Module } from '@nestjs/common';
import { SessionAdaptationService } from './session-adaptation.service';
import { SessionAdaptationController } from './session-adaptation.controller';

@Module({
  controllers: [SessionAdaptationController],
  providers: [SessionAdaptationService],
})
export class SessionAdaptationModule {}
