import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { use } from 'react';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post("/:groupId/request")
  @UseGuards(AuthGuard('jwt'))
  createGroup(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    return this.groupService.sendGroupRequest(userId, groupId);
  }

}
