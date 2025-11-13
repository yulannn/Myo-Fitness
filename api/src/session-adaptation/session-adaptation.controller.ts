import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessionAdaptationService } from './session-adaptation.service';
import { CreateSessionAdaptationDto } from './dto/create-session-adaptation.dto';
import { UpdateSessionAdaptationDto } from './dto/update-session-adaptation.dto';

@Controller('session-adaptation')
export class SessionAdaptationController {
  constructor(private readonly sessionAdaptationService: SessionAdaptationService) { }


}
