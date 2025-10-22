import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateTrainingSessionDto } from './dto/create-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-session.dto';

@Controller('api/v1/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) { }


}
