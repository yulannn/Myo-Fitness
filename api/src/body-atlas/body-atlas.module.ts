import { Module } from '@nestjs/common';
import { BodyAtlasController } from './body-atlas.controller';
import { BodyAtlasService } from './body-atlas.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BodyAtlasController],
  providers: [BodyAtlasService],
  exports: [BodyAtlasService],
})
export class BodyAtlasModule {}
