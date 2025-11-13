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
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('group')
@Controller('api/v1/group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau groupe' })
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({ status: 201, description: 'Groupe créé avec succès' })
  create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    const userId = req.user.userId;
    return this.groupService.createGroup(createGroupDto, userId);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post(':groupId/request')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Envoyer une demande de rejoindre un groupe' })
  @ApiParam({ name: 'groupId', type: Number, description: 'ID du groupe' })
  @ApiBody({ schema: { example: { receiverId: 2 } } })
  @ApiResponse({ status: 201, description: 'Demande envoyée avec succès' })
  createGroup(
    @Param('groupId') groupId: number,
    @Body() body: { receiverId: number },
    @Request() req,
  ) {
    const userId = req.user.userId;
    const receiverId = body.receiverId;
    return this.groupService.sendGroupRequest(userId, receiverId, groupId);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch('request/:requestId/accept')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accepter une demande de groupe' })
  @ApiParam({
    name: 'requestId',
    type: String,
    description: 'ID de la demande',
  })
  @ApiResponse({ status: 200, description: 'Demande acceptée' })
  acceptGroupRequest(@Param('requestId') requestId: string) {
    return this.groupService.acceptGroupRequest(requestId);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch('request/:requestId/decline')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refuser une demande de groupe' })
  @ApiParam({
    name: 'requestId',
    type: String,
    description: 'ID de la demande',
  })
  @ApiResponse({ status: 200, description: 'Demande refusée' })
  declineGroupRequest(@Param('requestId') requestId: string) {
    return this.groupService.declineGroupRequest(requestId);
  }

  @Get('requests')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Récupérer toutes les demandes de groupes en attente pour l’utilisateur',
  })
  @ApiResponse({ status: 200, description: 'Liste des demandes en attente' })
  getPendingGroupRequests(@Request() req) {
    const userId = req.user.userId;
    return this.groupService.getPendingGroupRequests(userId);
  }

  @Get('groupmembers/:groupId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les membres d’un groupe' })
  @ApiParam({ name: 'groupId', type: Number, description: 'ID du groupe' })
  @ApiResponse({ status: 200, description: 'Liste des membres du groupe' })
  getGroupMembers(@Param('groupId') groupId: number) {
    return this.groupService.getGroupMembers(groupId);
  }

  @Get('mygroups')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer les groupes auxquels l’utilisateur appartient',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des groupes de l’utilisateur',
  })
  getUserGroups(@Request() req) {
    const userId = req.user.userId;
    return this.groupService.getGroupsList(userId);
  }
}
