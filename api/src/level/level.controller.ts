import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { LevelService } from './level.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/level')
export class LevelController {
    constructor(private readonly levelService: LevelService) { }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getMyLevel(@Request() req) {
        const userId = req.user.userId;
        return this.levelService.getLevelByUserId(userId);
    }

    @Get('me/stats')
    @UseGuards(AuthGuard('jwt'))
    getMyStats(@Request() req) {
        const userId = req.user.userId;
        return this.levelService.getUserStats(userId);
    }

    @Post('initialize')
    @UseGuards(AuthGuard('jwt'))
    initializeMyLeveling(@Request() req) {
        const userId = req.user.userId;
        return this.levelService.initializeLeveling(userId);

    }

    
}