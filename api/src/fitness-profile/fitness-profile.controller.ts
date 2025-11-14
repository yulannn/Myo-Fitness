import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FitnessProfileService } from './fitness-profile.service';
import { CreateFitnessProfileDto } from './dto/create-fitness-profile.dto';
import { UpdateFitnessProfileDto } from './dto/update-fitness-profile.dto';
import { FitnessProfileEntity } from './entities/fitness-profile.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('fitness-profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/fitness-profile')
export class FitnessProfileController {
  constructor(private readonly fitnessProfileService: FitnessProfileService) {}


  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @ApiOperation({ summary: 'Créer un nouveau profil fitness' })
  @ApiBody({ type: CreateFitnessProfileDto })
  @ApiResponse({
    status: 201,
    description: 'Profil fitness créé avec succès',
    type: FitnessProfileEntity,
    schema: {
      example: {
        id: 1,
        userId: 2,
        age: 28,
        height: 175,
        weight: 70,
        trainingFrequency: 4,
        experienceLevel: 'INTERMEDIATE',
        goals: ['MUSCLE_GAIN', 'FAT_LOSS'],
        gender: 'MALE',
        bodyWeight: true,
        createdAt: '2025-10-22T12:00:00.000Z',
        updatedAt: '2025-10-22T12:00:00.000Z',
      },
    },
  })
  create(@Body() createFitnessProfileDto: CreateFitnessProfileDto, @Request() req) {
    const userId = req.user.id;
    return this.fitnessProfileService.create(createFitnessProfileDto, userId);
  }


  @Get()
  @ApiOperation({ summary: 'Récupérer tous les profils fitness de l’utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des profils fitness',
    type: [FitnessProfileEntity],
  })
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.fitnessProfileService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un profil fitness par ID' })
  @ApiParam({ name: 'id', description: 'ID du profil fitness', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Profil fitness trouvé',
    type: FitnessProfileEntity,
  })
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.fitnessProfileService.findOne(+id, userId);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un profil fitness' })
  @ApiParam({ name: 'id', description: 'ID du profil à modifier', type: Number, example: 1 })
  @ApiBody({ type: UpdateFitnessProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profil fitness mis à jour',
    type: FitnessProfileEntity,
  })
  update(@Param('id') id: string, @Body() updateFitnessProfileDto: UpdateFitnessProfileDto, @Request() req) {
    const userId = req.user.userId;
    return this.fitnessProfileService.update(+id, updateFitnessProfileDto, userId);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un profil fitness' })
  @ApiParam({ name: 'id', description: 'ID du profil à supprimer', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Profil fitness supprimé avec succès',
    schema: { example: { message: 'Profil fitness supprimé avec succès' } },
  })
  remove(@Param('id') id: string) {
    return this.fitnessProfileService.remove(+id);
  }
}
