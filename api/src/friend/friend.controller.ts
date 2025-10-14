import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { FriendService } from './friend.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';


@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) { }


  @Post()
  @UseGuards(AuthGuard('jwt'))
  sendFriendRequest(@Body() createFriendDto: CreateFriendDto, @Request() req) {
    const userId = req.user.userId;
    return this.friendService.sendFriendRequest(createFriendDto, userId);
  }

  @Patch(':requestId/accept')
  acceptFriendRequest(@Param('requestId') requestId: string) {
    return this.friendService.acceptFriendRequest(requestId);
  }

  @Patch(':requestId/decline')
  declineFriendRequest(@Param('requestId') requestId: string) {
    return this.friendService.declineFriendRequest(requestId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getPendingFriendRequest(@Request() req) {
    const userId = req.user.userId;
    return this.friendService.getPendingFriendRequest(userId);
  }


}
