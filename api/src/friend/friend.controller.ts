import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FriendEntity } from './entities/friend.entity';
import { Throttle } from '@nestjs/throttler';

@ApiTags('friend')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) { }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des utilisateurs' })
  @ApiQuery({ name: 'q', required: true, description: 'Terme de recherche (nom ou email)' })
  searchUsers(@Query('q') query: string, @Request() req) {
    const userId = req.user.userId;
    return this.friendService.searchUsers(query, userId);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @ApiOperation({ summary: 'Envoyer une demande d’amitié' })
  @ApiBody({ type: CreateFriendDto })
  @ApiResponse({
    status: 201,
    description: 'Demande d’amitié envoyée',
    type: FriendEntity,
    schema: {
      example: {
        id: 1,
        userId: 2,
        friendId: 3,
        status: 'PENDING',
        createdAt: '2025-10-22T12:00:00.000Z',
        user: { id: 1, name: 'Jean' },
        friend: { id: 3, name: 'Bob' },
      },
    },
  })
  sendFriendRequest(@Body() createFriendDto: CreateFriendDto, @Request() req) {
    const userId = req.user.userId;
    return this.friendService.sendFriendRequest(createFriendDto, userId);
  }

  @Patch(':requestId/accept')
  @ApiOperation({ summary: 'Accepter une demande d’amitié' })
  @ApiParam({
    name: 'requestId',
    description: 'ID de la demande',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Demande acceptée',
    schema: { example: { message: 'Demande d’amitié acceptée' } },
  })
  acceptFriendRequest(@Param('requestId') requestId: string) {
    return this.friendService.acceptFriendRequest(requestId);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':requestId/decline')
  @ApiOperation({ summary: 'Refuser une demande d’amitié' })
  @ApiParam({
    name: 'requestId',
    description: 'ID de la demande',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Demande refusée',
    schema: { example: { message: 'Demande d’amitié refusée' } },
  })
  declineFriendRequest(@Param('requestId') requestId: string) {
    return this.friendService.declineFriendRequest(requestId);
  }

  @Get()
  @ApiOperation({
    summary:
      'Récupérer toutes les demandes d’amitié en attente pour l’utilisateur',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des demandes en attente',
    type: [FriendEntity],
  })
  getPendingFriendRequest(@Request() req) {
    const userId = req.user.userId;
    return this.friendService.getPendingFriendRequest(userId);
  }

  @Get('friendlist')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Récupérer la liste des amis de l’utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des amis',
    type: [FriendEntity],
    schema: {
      example: [
        {
          id: 1,
          userId: 2,
          friendId: 3,
          status: 'ACCEPTED',
          createdAt: '2025-10-22T12:00:00.000Z',
          user: { id: 2, name: 'Jean' },
          friend: { id: 3, name: 'Bob' },
        },
        {
          id: 2,
          userId: 2,
          friendId: 4,
          status: 'ACCEPTED',
          createdAt: '2025-10-23T09:30:00.000Z',
          user: { id: 2, name: 'Jean' },
          friend: { id: 4, name: 'Alice' },
        },
      ],
    },
  })
  getFriendsList(@Request() req) {
    const userId = req.user.userId;
    return this.friendService.getFriendsList(userId);
  }
}
