import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { AuthGuard } from '@nestjs/passport';
import { LeaderboardType } from './dto/leaderboard-type.enum';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('leaderboard')
@ApiBearerAuth()
@Controller('api/v1/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('friends')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get friends leaderboard by type',
    description:
      'Returns the leaderboard for a specific type (sessions, streak, level, volume), limited to the current user and their friends',
  })
  @ApiQuery({
    name: 'type',
    enum: LeaderboardType,
    required: true,
    description: 'Type of leaderboard to retrieve',
  })
  async getFriendsLeaderboard(
    @Request() req,
    @Query('type') type: LeaderboardType,
  ): Promise<LeaderboardResponseDto> {
    const userId = req.user.userId;
    // 🔄 Force update stats to ensure data correctness
    await this.leaderboardService.updateUserStats(userId);
    return this.leaderboardService.getFriendsLeaderboard(userId, type);
  }

  @Get('types')
  @ApiOperation({
    summary: 'Get available leaderboard types',
    description: 'Returns all available leaderboard types',
  })
  getLeaderboardTypes(): {
    type: string;
    label: string;
    description: string;
  }[] {
    return [
      {
        type: LeaderboardType.TOTAL_SESSIONS,
        label: 'Séances complétées',
        description: 'Nombre total de séances terminées',
      },
      {
        type: LeaderboardType.CURRENT_STREAK,
        label: 'Streak actuel',
        description: "Jours consécutifs d'entraînement",
      },
      {
        type: LeaderboardType.LEVEL,
        label: 'Niveau',
        description: "Niveau global de l'utilisateur",
      },
      {
        type: LeaderboardType.TOTAL_VOLUME,
        label: 'Volume total',
        description: 'Volume total levé (kg)',
      },
    ];
  }
}
