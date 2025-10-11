import { Module } from '@nestjs/common';
import { FitnessProfileService } from './fitness-profile.service';
import { FitnessProfileController } from './fitness-profile.controller';

@Module({
  controllers: [FitnessProfileController],
  providers: [FitnessProfileService],
})
export class FitnessProfileModule {}
