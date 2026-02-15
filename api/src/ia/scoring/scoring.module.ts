import { Module } from '@nestjs/common';
import { TemplateScorerService } from './template-scorer.service';

@Module({
  providers: [TemplateScorerService],
  exports: [TemplateScorerService],
})
export class ScoringModule {}
