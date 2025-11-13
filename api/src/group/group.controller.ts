import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('api/v1/group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    const userId = req.user.userId;
    return this.groupService.createGroup(createGroupDto, userId);
  }

  @Post('groupId/request')
  @UseGuards(AuthGuard('jwt'))
  createGroup(@Request() req) {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const receiverId = req.body.receiverId;
    return this.groupService.sendGroupRequest(userId, receiverId, groupId);
  }

  @Patch('request/:requestId/accept')
  acceptGroupRequest(@Param('requestId') requestId: string) {
    return this.groupService.acceptGroupRequest(requestId);
  }

  @Patch('request/:requestId/decline')
  declineGroupRequest(@Param('requestId') requestId: string) {
    return this.groupService.declineGroupRequest(requestId);
  }

  @Get('requests')
  getPendingGroupRequests(@Request() req) {
    const userId = req.user.userId;
    return this.groupService.getPendingGroupRequests(userId);
  }

  @Get('groupmembers/:groupId')
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
