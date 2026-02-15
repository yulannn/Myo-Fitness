import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { SessionAdaptationService } from './session-adaptation.service';
import { CreateSessionAdaptationDto } from './dto/create-session-adaptation.dto';
import { UpdateSessionAdaptationDto } from './dto/update-session-adaptation.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/session-adaptation')
export class SessionAdaptationController {
  constructor(
    private readonly sessionAdaptationService: SessionAdaptationService,
  ) {}

  @Get(':trainingSessionId')
  getSessionWithPerformances(
    @Param('trainingSessionId', ParseIntPipe) trainingSessionId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionAdaptationService.getSessionWithPerformances(
      trainingSessionId,
      userId,
    );
  }

  @Post(':trainingSessionId/adapt')
  createAdaptedSession(
    @Param('trainingSessionId', ParseIntPipe) trainingSessionId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionAdaptationService.createAdaptedSessionFromPrevious(
      trainingSessionId,
      userId,
    );
  }

  @Post(':trainingSessionId/similar')
  createNewSimilarSession(
    @Param('trainingSessionId', ParseIntPipe) trainingSessionId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionAdaptationService.createNewSimilarSession(
      trainingSessionId,
      userId,
    );
  }
}
