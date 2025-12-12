import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe, Post, Request, Delete, Put, Get, Query } from '@nestjs/common';
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
  constructor(private readonly sessionService: SessionService) { }

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
  getSessionById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.sessionService.getSessionById(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/all')
  @ApiOperation({
    summary: 'Récupérer toutes les sessions d\'un utilisateur',
    description: 'Supporte le filtrage par plage de dates via query params (startDate, endDate) pour optimiser le chargement du calendrier'
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
}
