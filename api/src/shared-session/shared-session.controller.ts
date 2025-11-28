import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SharedSessionService } from './shared-session.service';
import { CreateSharedSessionDto } from './dto/create-shared-session.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/shared-sessions')
@UseGuards(AuthGuard('jwt'))
export class SharedSessionController {
    constructor(private readonly sharedSessionService: SharedSessionService) { }

    @Post()
    create(@Request() req, @Body() createSharedSessionDto: CreateSharedSessionDto) {
        return this.sharedSessionService.create(req.user.userId, createSharedSessionDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.sharedSessionService.findAll(req.user.userId);
    }

    @Post(':id/join')
    join(@Request() req, @Param('id') id: string) {
        return this.sharedSessionService.join(req.user.userId, id);
    }

    @Post(':id/leave')
    leave(@Request() req, @Param('id') id: string) {
        return this.sharedSessionService.leave(req.user.userId, id);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.sharedSessionService.delete(req.user.userId, id);
    }

    @Post(':id/invite-group')
    inviteGroup(@Request() req, @Param('id') id: string, @Body() body: { groupId: number }) {
        return this.sharedSessionService.inviteGroup(req.user.userId, id, body.groupId);
    }

    @Post(':id/invite-friend')
    inviteFriend(@Request() req, @Param('id') id: string, @Body() body: { friendId: number }) {
        return this.sharedSessionService.inviteFriend(req.user.userId, id, body.friendId);
    }
}
