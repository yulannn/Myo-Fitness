import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/activity')
@UseGuards(AuthGuard('jwt'))
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('feed')
  getFeed(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.activityService.getFeed(
      req.user.userId,
      Number(page),
      Number(limit),
    );
  }

  /**
   * 🔒 Récupérer les détails d'une session d'ami
   * Sécurisé : vérifie que l'utilisateur est ami avec le propriétaire
   */
  @Get('session/:sessionId/details')
  getSessionDetails(
    @Request() req,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.activityService.getSessionDetailsForFriend(
      req.user.userId,
      sessionId,
    );
  }

  @Post(':id/react')
  toggleReaction(
    @Request() req,
    @Param('id', ParseIntPipe) activityId: number,
    @Body('emoji') emoji: string,
  ) {
    return this.activityService.toggleReaction(
      req.user.userId,
      activityId,
      emoji,
    );
  }
}
