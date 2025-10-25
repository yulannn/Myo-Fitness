import { Controller, Post, Body, Request, UseGuards, Delete } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateTrainingProgramDto } from './dto/create-program.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, getSchemaPath } from '@nestjs/swagger';
import { TrainingProgramEntity } from '../program/entities/program.entity';
import { Throttle } from '@nestjs/throttler';
import { SessionDataWrapperDto } from './dto/session-data.dto';
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
    @ApiResponse({ status: 201, description: 'Programme créé avec succès', type: TrainingProgramEntity })
    create(@Body() createProgramDto: CreateTrainingProgramDto, @Request() req) {
        const userId = req.user.userId;
        return this.programService.create(createProgramDto, userId);
    }

    @Post('manual')
    @UseGuards(AuthGuard('jwt'))
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
    @ApiResponse({ status: 201, description: 'Programme créé avec succès', type: TrainingProgramEntity })
    createManual(@Body() body: CreateManualProgramDto, @Request() req) {
        const userId = req.user.userId;
        return this.programService.createManualProgram(body, userId);
    }

    @Post('add-session')
    @ApiOperation({ summary: 'Ajouter une session à un programme existant' })
    @ApiBody({
        schema: {
            example: {
                programId: 1,
                sessionData: {
                    name: 'Jour 4 - Abdos & Cardio',
                    exercises: [
                        { id: 5, sets: 4, reps: 20 },
                        { id: 8, sets: 3, reps: 15 }
                    ]
                }
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Session ajoutée avec succès' })
    async addSessionToProgram(@Body() body: AddSessionToProgramDto, @Request() req) {
        const userId = req.user.userId;
        return this.programService.addSessionToProgram(body, userId);
    }

    @Delete('delete-session')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Supprimer une session d’un programme existant' })
    @ApiBody({
        schema: {
            example: {
                programId: 4,
                sessionId: 10,
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Session supprimée avec succès du programme' })
    async deleteSessionFromProgram(@Body() body: { programId: number; sessionId: number }, @Request() req) {
        const userId = req.user.userId;
        return this.programService.deleteSessionFromProgram(body, userId);
    }
}
