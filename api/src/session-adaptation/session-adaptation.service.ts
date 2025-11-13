import { Injectable } from '@nestjs/common';
import { CreateSessionAdaptationDto } from './dto/create-session-adaptation.dto';
import { UpdateSessionAdaptationDto } from './dto/update-session-adaptation.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SessionAdaptationService {
  constructor(private prisma: PrismaService) { }




}
