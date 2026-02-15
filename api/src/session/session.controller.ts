import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Post,
  Request,
  Delete,
  Put,
  Get,
  Query,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { UpdateSessionDateDto } from './dto/update-session.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExerciseDataDto } from 'src/program/dto/session-data.dto';

@ApiTags('session')
@Controller('api/v1/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une session par ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la session à récupérer',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Session récupérée avec succès',
  })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  getSessionById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.sessionService.getSessionById(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/calendar')
  @ApiOperation({
    summary: '🚀 Récupérer les sessions optimisées pour le calendrier',
    description:
      "Endpoint ultra-optimisé qui retourne uniquement les données minimales pour l'affichage calendrier",
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions calendrier récupérées avec succès',
  })
  getSessionsForCalendar(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.userId;
    return this.sessionService.getSessionsForCalendar(
      userId,
      startDate,
      endDate,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/all')
  @ApiOperation({
    summary: "Récupérer toutes les sessions d'un utilisateur",
    description:
      'Supporte le filtrage par plage de dates via query params (startDate, endDate) pour optimiser le chargement du calendrier',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions récupérées avec succès',
  })
  getAllUserSessions(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.userId;
    return this.sessionService.getAllUserSessions(userId, startDate, endDate);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/stats')
  @ApiOperation({
    summary: '📊 Récupérer les statistiques utilisateur optimisées',
    description:
      'Calcul optimisé côté DB des statistiques de sessions (total, complétées, à venir)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
  })
  getUserStats(@Request() req) {
    const userId = req.user.userId;
    return this.sessionService.getUserStats(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/in-progress')
  @ApiOperation({
    summary: '🔄 Récupérer la session en cours (IN_PROGRESS)',
    description:
      "Retourne la session actuellement en cours d'exécution, permettant à l'utilisateur de la reprendre",
  })
  @ApiResponse({
    status: 200,
    description: 'Session en cours récupérée (ou null si aucune)',
  })
  getInProgressSession(@Request() req) {
    const userId = req.user.userId;
    return this.sessionService.getInProgressSession(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('user/in-progress/:id')
  @ApiOperation({
    summary: '🚫 Annuler une session en cours',
    description:
      'Annule la session IN_PROGRESS et la remet en SCHEDULED. Les performances sont supprimées.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la session à annuler',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Session annulée avec succès',
  })
  @ApiResponse({ status: 400, description: 'Session pas en cours' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  cancelInProgressSession(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionService.cancelInProgressSession(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/records')
  @ApiOperation({
    summary: '🏆 Récupérer les records personnels (top 3)',
    description:
      'Calcul optimisé côté DB des 3 meilleurs records (poids × reps) par exercice',
  })
  @ApiResponse({
    status: 200,
    description: 'Records personnels récupérés avec succès',
  })
  getPersonalRecords(@Request() req, @Query('limit') limit?: string) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit, 10) : 3;
    return this.sessionService.getPersonalRecords(userId, limitNum);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/streak')
  @ApiOperation({
    summary: '🔥 Récupérer les données de streak',
    description:
      "Calcul optimisé côté DB de la série de jours consécutifs d'entraînement",
  })
  @ApiResponse({
    status: 200,
    description: 'Données de streak récupérées avec succès',
  })
  getUserStreak(@Request() req) {
    const userId = req.user.userId;
    return this.sessionService.getUserStreak(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/completed')
  @ApiOperation({ summary: 'Marquer une session comme terminée' })
  @ApiParam({
    name: 'id',
    description: 'ID de la session à marquer comme terminée',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Session marquée comme terminée avec succès',
  })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  completedSession(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.sessionService.completedSession(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/date')
  @ApiOperation({ summary: 'Mettre à jour la date d’une session' })
  @ApiParam({
    name: 'id',
    description: 'ID de la session à mettre à jour',
    type: Number,
  })
  @ApiBody({
    description: 'Nouvelles informations de date pour la session',
    type: UpdateSessionDateDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Date de session mise à jour avec succès',
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  updateDate(
    @Param('id') id: string,
    @Body() updateSessionDateDto: UpdateSessionDateDto,
  ) {
    return this.sessionService.updateDate(Number(id), updateSessionDateDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/sessionName')
  @ApiOperation({ summary: "Mettre à jour le nom d'une session" })
  @ApiParam({
    name: 'id',
    description: 'ID de la session à mettre à jour',
    type: Number,
  })
  @ApiBody({
    description: 'Nouveau nom pour la session',
    schema: {
      type: 'object',
      properties: {
        sessionName: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Nom de session mis à jour avec succès',
  })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  updateSessionName(
    @Param('id', ParseIntPipe) id: number,
    @Body('sessionName') sessionName: string,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionService.updateSessionName(id, sessionName, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete-exercise/:sessionId/:exerciceId')
  @ApiOperation({ summary: 'Supprimer un exercice d’une session' })
  @ApiResponse({
    status: 200,
    description: 'Exercice supprimé avec succès de la session',
  })
  async deleteExerciseFromSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('exerciceId', ParseIntPipe) exerciceId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionService.deleteExerciseFromSession(
      sessionId,
      exerciceId,
      userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('add-exercise/:sessionId/:exerciceId')
  @ApiOperation({ summary: 'Ajouter un exercice à une session' })
  @ApiBody({
    schema: {
      example: {
        id: 10,
        sets: 3,
        reps: 12,
        weight: 40,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Exercice ajouté avec succès à la session',
  })
  async addExerciseToSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('exerciceId', ParseIntPipe) exerciceId: number,
    @Body() exerciseData: ExerciseDataDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionService.addExerciseToSession(
      sessionId,
      exerciceId,
      exerciseData,
      userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update-exercise/:sessionId/:exerciceId')
  @ApiOperation({ summary: 'Mettre à jour un exercice dans une session' })
  @ApiBody({
    schema: {
      example: {
        id: 10,
        sets: 4,
        reps: 10,
        weight: 50,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Exercice mis à jour avec succès',
  })
  async updateExerciseInSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('exerciceId', ParseIntPipe) exerciceId: number,
    @Body() exerciseData: ExerciseDataDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionService.updateExerciceFromSession(
      sessionId,
      exerciceId,
      exerciseData,
      userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une session (annulation)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la session à supprimer',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Session supprimée avec succès',
  })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  async deleteSession(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.sessionService.deleteSession(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('exercice-session/:id/sets')
  @ApiOperation({
    summary: "🔧 Modifier le nombre de séries d'un exercice pendant la session",
    description:
      "Permet d'ajouter ou enlever des séries à un exercice en cours de session",
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'ExerciceSession",
    type: Number,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sets: {
          type: 'number',
          description: 'Nouveau nombre de séries (1-20)',
          minimum: 1,
          maximum: 20,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Nombre de séries mis à jour avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou session déjà terminée',
  })
  @ApiResponse({ status: 404, description: 'Exercice de session non trouvé' })
  async updateExerciceSessionSets(
    @Param('id', ParseIntPipe) id: number,
    @Body('sets', ParseIntPipe) sets: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionService.updateExerciceSessionSets(id, sets, userId);
  }
}
