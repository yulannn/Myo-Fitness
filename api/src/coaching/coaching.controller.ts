import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CoachingService } from './coaching.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCoachingRequestDto } from './dto/create-coaching-request.dto';
import { RespondCoachingRequestDto } from './dto/respond-coaching-request.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('coaching')
@Controller('api/v1/coaching')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CoachingController {
  constructor(private readonly coachingService: CoachingService) { }

  @Post('request')
  @ApiOperation({ summary: 'Envoyer une demande de coaching à un client (Coach uniquement)' })
  @ApiResponse({ status: 201, description: 'Demande envoyée avec succès' })
  async requestCoaching(@Request() req, @Body() dto: CreateCoachingRequestDto) {
    return this.coachingService.createRequest(req.user.userId, dto);
  }

  @Patch('respond')
  @ApiOperation({ summary: 'Accepter ou refuser une demande de coaching (Client uniquement)' })
  @ApiResponse({ status: 200, description: 'Réponse enregistrée' })
  async respondCoaching(@Request() req, @Body() dto: RespondCoachingRequestDto) {
    return this.coachingService.respondToRequest(req.user.userId, dto);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Récupérer la liste des clients liés (Coach uniquement)' })
  @ApiResponse({ status: 200, description: 'Liste des clients' })
  async getClients(@Request() req) {
    return this.coachingService.getCoachClients(req.user.userId);
  }

  @Get('my-coach')
  @ApiOperation({ summary: 'Récupérer son coach actuel (Client uniquement)' })
  @ApiResponse({ status: 200, description: 'Infos du coach' })
  async getMyCoach(@Request() req) {
    return this.coachingService.getMyCoach(req.user.userId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Récupérer les demandes de coaching en attente (Client uniquement)' })
  @ApiResponse({ status: 200, description: 'Liste des demandes en attente' })
  async getPendingRequests(@Request() req) {
    return this.coachingService.getPendingRequests(req.user.userId);
  }

  @Delete('relationship/:id')
  @ApiOperation({ summary: 'Rompre une relation de coaching (Coach ou Client)' })
  @ApiResponse({ status: 200, description: 'Relation rompue' })
  async deleteRelationship(@Request() req, @Param('id') id: string) {
    return this.coachingService.terminateRelationship(req.user.userId, parseInt(id));
  }
}
