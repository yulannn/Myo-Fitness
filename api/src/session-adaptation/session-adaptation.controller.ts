import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SessionAdaptationService } from './session-adaptation.service';
import { CreateSessionAdaptationDto } from './dto/create-session-adaptation.dto';
import { UpdateSessionAdaptationDto } from './dto/update-session-adaptation.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('api/v1/session-adaptation')
export class SessionAdaptationController {
  constructor(private readonly sessionAdaptationService: SessionAdaptationService) { }

  @Get(':trainingSessionId')
  @UseGuards(AuthGuard('jwt'))
  getSessionWithPerformances(@Param('trainingSessionId') trainingSessionId: string, @Request() req) {
    const userId = req.user.userId;
    return this.sessionAdaptationService.getSessionWithPerformances(+trainingSessionId, userId);
  }

  @Post(':trainingSessionId/adapt')
  @UseGuards(AuthGuard('jwt'))
  createAdaptedSession(@Param('trainingSessionId') trainingSessionId: string, @Request() req) {
    const userId = req.user.userId;
    return this.sessionAdaptationService.createAdaptedSessionFromPrevious(+trainingSessionId, userId);
  }


}
