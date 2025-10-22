import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExerciceService } from './exercice.service';
import { CreateExerciceDto } from './dto/create-exercice.dto';
import { UpdateExerciceDto } from './dto/update-exercice.dto';
import { ExerciceEntity } from './entities/exercice.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('exercice')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/exercice')
export class ExerciceController {
  constructor(private readonly exerciceService: ExerciceService) {}


  @Post()
  @ApiOperation({ summary: 'Créer un nouvel exercice' })
  @ApiBody({ type: CreateExerciceDto })
  @ApiResponse({
    status: 201,
    description: 'Exercice créé avec succès',
    type: ExerciceEntity,
    schema: {
      example: {
        id: 1,
        name: 'Pompes',
        difficulty: 3,
        description: 'Exercice classique pour le haut du corps',
        type: 'STRENGTH',
        Materials: false,
        bodyWeight: true,
        isDefault: false,
        createdByUserId: 2,
        createdAt: '2025-10-22T12:00:00.000Z',
        updatedAt: '2025-10-22T12:00:00.000Z',
      },
    },
  })
  create(@Body() createExerciceDto: CreateExerciceDto, @Request() req) {
    const userId = req.user.userId;
    return this.exerciceService.create(createExerciceDto, userId);
  }
 

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les exercices de l’utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des exercices',
    type: [ExerciceEntity],
    schema: {
      example: [
        {
          id: 1,
          name: 'Pompes',
          difficulty: 3,
          description: 'Exercice classique pour le haut du corps',
          type: 'STRENGTH',
          Materials: false,
          bodyWeight: true,
          isDefault: false,
          createdByUserId: 2,
          createdAt: '2025-10-22T12:00:00.000Z',
          updatedAt: '2025-10-22T12:00:00.000Z',
        },
      ],
    },
  })
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.exerciceService.findAll(userId);
  }

 
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un exercice par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l’exercice', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Exercice trouvé',
    type: ExerciceEntity,
  })
  findOne(@Param('id') id: string) {
    return this.exerciceService.findOne(+id);
  }

  
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un exercice' })
  @ApiBody({ type: UpdateExerciceDto })
  @ApiParam({ name: 'id', description: 'ID de l’exercice à modifier', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Exercice mis à jour',
    type: ExerciceEntity,
  })
  update(@Param('id') id: string, @Body() updateExerciceDto: UpdateExerciceDto) {
    return this.exerciceService.update(+id, updateExerciceDto);
  }

  
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un exercice' })
  @ApiParam({ name: 'id', description: 'ID de l’exercice à supprimer', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Exercice supprimé avec succès',
    schema: { example: { message: 'Exercice supprimé avec succès' } },
  })
  remove(@Param('id') id: string) {
    return this.exerciceService.remove(+id);
  }

  
  @Post(':id/equipments/:equipmentId')
  @ApiOperation({ summary: 'Ajouter un équipement à un exercice' })
  @ApiParam({ name: 'id', description: 'ID de l’exercice', type: Number, example: 1 })
  @ApiParam({ name: 'equipmentId', description: 'ID de l’équipement', type: Number, example: 2 })
  @ApiResponse({
    status: 200,
    description: 'Équipement ajouté à l’exercice',
    schema: {
      example: {
        exerciceId: 1,
        equipmentId: 2,
      },
    },
  })
  addEquipment(@Param('id') exerciceId: string, @Param('equipmentId') equipmentId: string) {
    return this.exerciceService.addEquipment(+exerciceId, +equipmentId);
  }
}
