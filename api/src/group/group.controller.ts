import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { use } from 'react';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}



  @Post("groupId/request")
  @UseGuards(AuthGuard('jwt'))
  createGroup(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    return this.groupService.sendGroupRequest(userId, groupId);
  }

  @Patch('request/:requestId/accept')
  acceptGroupRequest(@Param('requestId') requestId: string) {
    return this.groupService.acceptGroupRequest(requestId);
  }

  @Patch('request/:requestId/decline')
  declineGroupRequest(@Param('requestId') requestId: string) {
    return this.groupService.declineGroupRequest(requestId);
  }

  @Get ('requests')
  getPendingGroupRequests(@Request() req) {
    const userId = req.user.userId;
    return this.groupService.getPendingGroupRequests(userId);
  }

  @Get ('groupmembers/:groupId')
    getGroupMembers(@Param('groupId') groupId: number) {
        return this.groupService.getGroupMembers(groupId); 
    }

    @Get('mygroups')
    @UseGuards(AuthGuard('jwt'))
    getUserGroups(@Request() req) {
        const userId = req.user.userId;
      return this.groupService.getGroupsList(userId);
    }

}
