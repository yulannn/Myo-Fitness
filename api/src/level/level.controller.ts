import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { LevelService } from './level.service';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';


@Controller('api/v1/level')
export class LevelController {
    constructor(private readonly levelService: LevelService) {}

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getMyLevel(@Request() req) {
        const userId = req.user.userId;
        return this.levelService.getLevelByUserId(userId);
    }   
}