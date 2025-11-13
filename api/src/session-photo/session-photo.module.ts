import { Module } from '@nestjs/common';
import { SessionPhotoService } from './session-photo.service';
import { SessionPhotoController } from './session-photo.controller';

@Module({
  controllers: [SessionPhotoController],
  providers: [SessionPhotoService],
})
export class SessionPhotoModule {}
