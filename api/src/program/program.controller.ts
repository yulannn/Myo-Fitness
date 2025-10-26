import {
    Controller,
    Post,
    Body,
    Request,
    UseGuards,
    Delete,
    Param,
    Put,
    ParseIntPipe,
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
import {
    ExerciseDataDto,
    SessionDataWrapperDto,
} from './dto/session-data.dto';
import { CreateManualProgramDto } from './dto/create-manual-program.dto';
import { AddSessionToProgramDto } from './dto/add-session-program.dto';

@ApiTags('program')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/program')
export class ProgramController {
    constructor(private readonly programService: ProgramService) { }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post()
    @ApiOperation({ summary: 'Créer un nouveau programme d’entraînement' })
    @ApiBody({ type: CreateTrainingProgramDto })
    @ApiResponse({
        status: 201,
        description: 'Programme créé avec succès',
        type: TrainingProgramEntity,
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
                programId: 1,
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
        return this.programService.deleteExerciseFromSession(sessionId, exerciceId, userId);
    }




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
        return this.programService.addExerciseToSession(sessionId, exerciceId, exerciseData, userId);
    }




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
        return this.programService.updateExerciceData(sessionId, exerciceId, exerciseData, userId);
    }
}
