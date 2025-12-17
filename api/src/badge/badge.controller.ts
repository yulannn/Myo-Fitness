import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BadgeService } from './badge.service';
import { AuthGuard } from '@nestjs/passport';
import { BadgeQueryDto, PinBadgeDto } from './dto/badge-query.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Badges')
@ApiBearerAuth()
@Controller('badges')
@UseGuards(AuthGuard('jwt'))
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) { }

  @Get()
  @ApiOperation({ summary: 'Récupère tous les badges disponibles' })
  async getAllBadges(@Query() query: BadgeQueryDto) {
    return this.badgeService.getAllBadges(query.category, query.tier);
  }

  @Get('my-badges')
  @ApiOperation({ summary: 'Récupère les badges débloqués par l\'utilisateur' })
  async getMyBadges(@Req() req: any) {
    const userId = req.user.userId;
    return this.badgeService.getUserBadges(userId);
  }

  @Get('with-progress')
  @ApiOperation({
    summary: 'Récupère tous les badges avec progression de l\'utilisateur',
  })
  async getBadgesWithProgress(@Req() req: any, @Query() query: BadgeQueryDto) {
    const userId = req.user.userId;
    return this.badgeService.getBadgesWithProgress(userId, query.category);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupère les statistiques de badges de l\'utilisateur' })
  async getBadgeStats(@Req() req: any) {
    const userId = req.user.userId;
    return this.badgeService.getUserBadgeStats(userId);
  }

  @Get('pinned')
  @ApiOperation({ summary: 'Récupère les badges épinglés au profil' })
  async getPinnedBadges(@Req() req: any) {
    const userId = req.user.userId;
    return this.badgeService.getPinnedBadges(userId);
  }

  @Post('pin')
  @ApiOperation({ summary: 'Épingle des badges sur le profil (max 3)' })
  async pinBadges(@Req() req: any, @Body() pinBadgeDto: PinBadgeDto) {
    const userId = req.user.userId;
    return this.badgeService.pinBadges(userId, pinBadgeDto.badgeIds);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Récupère la progression vers les badges' })
  async getBadgeProgress(@Req() req: any, @Query('code') code?: string) {
    const userId = req.user.userId;
    return this.badgeService.getBadgeProgress(userId, code);
  }
}
