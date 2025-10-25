import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateTrainingProgramDto } from './dto/create-program.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, getSchemaPath } from '@nestjs/swagger';
import { TrainingProgramEntity } from '../program/entities/program.entity';
import { Throttle } from '@nestjs/throttler';
import { SessionDataWrapperDto } from './dto/session-data.dto';
import { CreateManualProgramDto } from './dto/create-manual-program.dto';

@ApiTags('program')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}


    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post()
    @ApiOperation({ summary: 'Créer un nouveau programme d’entraînement' })
    @ApiBody({ type: CreateTrainingProgramDto })
    @ApiResponse({
        status: 201,
        description: 'Programme créé avec succès',
        type: TrainingProgramEntity,
        schema: {
        example: {
            id: 1,
            fitnessProfileId: 1,
            name: 'Programme Force & Endurance',
            description: 'Programme de 12 semaines',
            template: 'STRENGTH',
            status: 'DRAFT',
            createdAt: '2025-10-22T12:00:00.000Z',
            updatedAt: '2025-10-22T12:00:00.000Z',
            sessions: [],
        },
        },
    })
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
    @ApiResponse({
    status: 201,
    description: 'Programme créé avec succès',
    type: TrainingProgramEntity,
    })
    createManual(@Body() body: CreateManualProgramDto, @Request() req) {
    const userId = req.user.userId;
    return this.programService.createManualProgram(body, userId);
    }

}

