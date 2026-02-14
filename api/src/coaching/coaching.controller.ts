import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CoachingService } from './coaching.service';
import { CreateCoachingRequestDto } from './dto/create-coaching-request.dto';
import { RespondCoachingRequestDto } from './dto/respond-coaching-request.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Coaching')
@Controller('api/v1/coaching')
@UseGuards(AuthGuard('jwt'))
export class CoachingController {
  constructor(private readonly coachingService: CoachingService) { }

  // ── Créer / Répondre / Supprimer ───────────────────────────

  @Post('request')
  @ApiOperation({ summary: 'Envoyer une demande de coaching (Coach uniquement)' })
  async createRequest(@Request() req, @Body() dto: CreateCoachingRequestDto) {
    return this.coachingService.createRequest(req.user.userId, dto);
  }

  @Patch('respond')
  @ApiOperation({ summary: 'Répondre à une demande de coaching (Client uniquement)' })
  async respondToRequest(@Request() req, @Body() dto: RespondCoachingRequestDto) {
    return this.coachingService.respondToRequest(req.user.userId, dto);
  }

  @Delete('relationship/:id')
  @ApiOperation({ summary: 'Rompre une relation de coaching (Coach ou Client)' })
  async deleteRelationship(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.coachingService.terminateRelationship(req.user.userId, id);
  }

  // ── Lecture ────────────────────────────────────────────────

  @Get('clients')
  @ApiOperation({ summary: 'Liste enrichie des clients (Coach — Dashboard)' })
  async getClients(@Request() req) {
    return this.coachingService.getCoachClients(req.user.userId);
  }

  @Get('my-coach')
  @ApiOperation({ summary: 'Récupérer son coach actuel (Client)' })
  async getMyCoach(@Request() req) {
    return this.coachingService.getMyCoach(req.user.userId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Demandes en attente (Client)' })
  async getPendingRequests(@Request() req) {
    return this.coachingService.getPendingRequests(req.user.userId);
  }

  // ── Dashboard Coach — Vues détaillées ─────────────────────

  @Get('clients/:clientId')
  @ApiOperation({ summary: 'Détail complet d\'un client (Coach — sécurisé)' })
  async getClientDetail(
    @Request() req,
    @Param('clientId', ParseIntPipe) clientId: number,
  ) {
    return this.coachingService.getClientDetail(req.user.userId, clientId);
  }

  @Get('clients/:clientId/sessions/:sessionId')
  @ApiOperation({ summary: 'Détail d\'une séance d\'un client (Coach — sécurisé)' })
  async getClientSessionDetail(
    @Request() req,
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.coachingService.getClientSessionDetail(req.user.userId, clientId, sessionId);
  }

  @Post('clients/:clientId/sessions')
  @ApiOperation({ summary: 'Assigner une nouvelle séance à un client (Coach — sécurisé)' })
  async assignSession(
    @Request() req,
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() sessionData: any, // On accepte le format { name, exercises: [...] }
  ) {
    return this.coachingService.assignSessionToClient(req.user.userId, clientId, sessionData);
  }
}
