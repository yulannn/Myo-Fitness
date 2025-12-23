import { Module } from '@nestjs/common';
import { SessionTemplateController } from './session-template.controller';
import { SessionTemplateService } from './session-template.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SessionTemplateController],
  providers: [SessionTemplateService],
  exports: [SessionTemplateService],
})
export class SessionTemplateModule { }
