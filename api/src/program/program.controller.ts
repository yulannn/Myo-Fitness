import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Delete,
  Param,
  Get,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateTrainingProgramDto } from './dto/create-program.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';
import { TrainingProgramEntity } from '../program/entities/program.entity';
import { Throttle } from '@nestjs/throttler';
import { ExerciseDataDto, SessionDataWrapperDto } from './dto/session-data.dto';
import { CreateManualProgramDto } from './dto/create-manual-program.dto';
import { AddSessionToProgramDto } from './dto/add-session-program.dto';
import { UpdateProgramStatusDto } from './dto/update-program-status.dto';
import { UpdateTrainingProgramDto } from './dto/update-program.dto';
import { AddCardioToProgramDto } from './dto/cardio-program.dto';
import { PremiumGuard } from '../subscription/guards/premium.guard';

@ApiTags('program')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les programmes d’entraînement de l’utilisateur',
  })
  @ApiResponse({
    status: 200,
    description: 'Programmes récupérés avec succès',
    type: [TrainingProgramEntity],
  })
  getProgramsByUser(@Request() req) {
    const userId = req.user.userId;
    return this.programService.getProgramsByUser(userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer le programme actif de l’utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Programme actif récupéré avec succès',
    type: TrainingProgramEntity,
  })
  getActiveProgram(@Request() req) {
    const userId = req.user.userId;
    return this.programService.getActiveProgram(userId);
  }

  @Get('archived')
  @ApiOperation({
    summary: 'Récupérer les programmes archivés de l’utilisateur',
  })
  @ApiResponse({
    status: 200,
    description: 'Programmes archivés récupérés avec succès',
    type: [TrainingProgramEntity],
  })
  getArchivedPrograms(@Request() req) {
    const userId = req.user.userId;
    return this.programService.getArchivedPrograms(userId);
  }

  @Get(':programId')
  @ApiOperation({ summary: 'Récupérer un programme d’entraînement par ID' })
  @ApiResponse({
    status: 200,
    description: 'Programme récupéré avec succès',
    type: TrainingProgramEntity,
  })
  getProgramById(
    @Param('programId', ParseIntPipe) programId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.programService.getProgramById(programId, userId);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post()
  @UseGuards(PremiumGuard) // 🔒 Premium uniquement pour la génération IA
  @ApiOperation({
    summary:
      "Créer un nouveau programme d'entraînement (IA - Premium uniquement)",
  })
  @ApiBody({ type: CreateTrainingProgramDto })
  @ApiResponse({
    status: 201,
    description: 'Programme créé avec succès',
    type: TrainingProgramEntity,
  })
  @ApiResponse({
    status: 403,
    description: 'Cette fonctionnalité nécessite un abonnement premium',
  })
  create(@Body() createProgramDto: CreateTrainingProgramDto, @Request() req) {
    const userId = req.user.userId;
    return this.programService.create(createProgramDto, userId);
  }

  @Post('manual')
  @ApiOperation({ summary: 'Créer un programme d’entraînement manuellement' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        createProgramDto: { $ref: getSchemaPath(CreateTrainingProgramDto) },
        sessionData: { $ref: getSchemaPath(SessionDataWrapperDto) },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Programme créé avec succès',
    type: TrainingProgramEntity,
  })
  createManual(@Body() body: CreateManualProgramDto, @Request() req) {
    const userId = req.user.userId;
    return this.programService.createManualProgram(body, userId);
  }

  @Post('add-session/:programId')
  @ApiOperation({ summary: 'Ajouter une session à un programme existant' })
  @ApiBody({
    schema: {
      example: {
        sessionData: {
          name: 'Jour 4 - Abdos & Cardio',
          exercises: [
            { id: 5, sets: 4, reps: 20 },
            { id: 8, sets: 3, reps: 15 },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Session ajoutée avec succès' })
  async addSessionToProgram(
    @Param('programId', ParseIntPipe) programId: number,
    @Body() body: AddSessionToProgramDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.programService.addSessionToProgram(body, programId, userId);
  }

  @Delete('delete-session/:sessionId')
  @ApiOperation({ summary: 'Supprimer une session d’un programme existant' })
  @ApiResponse({
    status: 200,
    description: 'Session supprimée avec succès du programme',
  })
  async deleteSessionFromProgram(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.programService.deleteSessionFromProgram(sessionId, userId);
  }

  @Patch(':programId/status')
  @ApiOperation({ summary: "Mettre à jour le statut d'un programme" })
  @ApiBody({ type: UpdateProgramStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Statut du programme mis à jour avec succès',
    type: TrainingProgramEntity,
  })
  async updateProgramStatus(
    @Param('programId', ParseIntPipe) programId: number,
    @Body() updateStatusDto: UpdateProgramStatusDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.programService.updateProgramStatus(
      programId,
      updateStatusDto.status,
      userId,
    );
  }

  @Patch(':programId')
  @ApiOperation({ summary: 'Mettre à jour un programme d’entraînement' })
  @ApiBody({ type: UpdateTrainingProgramDto })
  @ApiResponse({
    status: 200,
    description: 'Programme mis à jour avec succès',
    type: TrainingProgramEntity,
  })
  update(
    @Param('programId', ParseIntPipe) programId: number,
    @Body() updateProgramDto: UpdateTrainingProgramDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.programService.updateProgram(
      programId,
      updateProgramDto,
      userId,
    );
  }

  @Post(':programId/clone')
  @ApiOperation({ summary: 'Cloner un programme d’entraînement (Importation)' })
  @ApiResponse({
    status: 201,
    description: 'Programme cloné avec succès',
    type: TrainingProgramEntity,
  })
  clone(@Param('programId', ParseIntPipe) programId: number, @Request() req) {
    const userId = req.user.userId;
    return this.programService.cloneProgram(programId, userId);
  }

  @Delete(':programId')
  @ApiOperation({ summary: 'Supprimer un programme d’entraînement' })
  @ApiResponse({
    status: 200,
    description: 'Programme supprimé avec succès',
  })
  remove(@Param('programId', ParseIntPipe) programId: number, @Request() req) {
    const userId = req.user.userId;
    return this.programService.deleteProgram(programId, userId);
  }

  // 🆕 Endpoints Cardio
  @Post(':programId/cardio')
  @ApiOperation({
    summary: 'Ajouter un exercice cardio à tous les templates du programme',
  })
  @ApiBody({ type: AddCardioToProgramDto })
  @ApiResponse({
    status: 201,
    description: 'Exercice cardio ajouté à tous les templates',
  })
  async addCardioToProgram(
    @Param('programId', ParseIntPipe) programId: number,
    @Body() dto: AddCardioToProgramDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.programService.addCardioToProgram(
      programId,
      dto.exerciseId,
      dto.position,
      dto.duration,
      userId,
    );
  }

  @Delete(':programId/cardio')
  @ApiOperation({ summary: 'Supprimer tous les exercices cardio du programme' })
  @ApiResponse({
    status: 200,
    description: 'Exercices cardio supprimés de tous les templates',
  })
  async removeCardioFromProgram(
    @Param('programId', ParseIntPipe) programId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.programService.removeCardioFromProgram(programId, userId);
  }
}
