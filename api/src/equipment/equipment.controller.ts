import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentEntity } from './entities/equipment.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('equipment')
@Controller('api/v1/equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @ApiOperation({ summary: 'Créer un nouvel équipement de musculation' })
  @ApiBody({ type: CreateEquipmentDto })
  @ApiResponse({
    status: 201,
    description: 'Équipement créé avec succès',
    type: EquipmentEntity,
    schema: {
      example: {
        id: 1,
        name: 'Haltère',
        description: 'Haltère de 20kg',
        createdAt: '2025-10-22T12:00:00.000Z',
        updatedAt: '2025-10-22T12:00:00.000Z',
      },
    },
  })
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les équipements' })
  @ApiResponse({
    status: 200,
    description: 'Liste de tous les équipements',
    type: [EquipmentEntity],
    schema: {
      example: [
        {
          id: 1,
          name: 'Haltère',
          description: 'Haltère de 20kg',
          createdAt: '2025-10-22T12:00:00.000Z',
          updatedAt: '2025-10-22T12:00:00.000Z',
        },
        {
          id: 2,
          name: 'Tapis de yoga',
          description: 'Tapis antidérapant bleu',
          createdAt: '2025-10-22T13:00:00.000Z',
          updatedAt: '2025-10-22T13:00:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.equipmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un équipement par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Équipement trouvé',
    type: EquipmentEntity,
    schema: {
      example: {
        id: 1,
        name: 'Haltère',
        description: 'Haltère de 20kg',
        createdAt: '2025-10-22T12:00:00.000Z',
        updatedAt: '2025-10-22T12:00:00.000Z',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(+id);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un équipement' })
  @ApiBody({ type: UpdateEquipmentDto })
  @ApiResponse({
    status: 200,
    description: 'Équipement mis à jour',
    type: EquipmentEntity,
    schema: {
      example: {
        id: 1,
        name: 'Haltère modifié',
        description: 'Haltère de 25kg',
        createdAt: '2025-10-22T12:00:00.000Z',
        updatedAt: '2025-10-22T14:00:00.000Z',
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(+id, updateEquipmentDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un équipement' })
  @ApiResponse({
    status: 200,
    description: 'Équipement supprimé avec succès',
    schema: {
      example: { message: 'Équipement supprimé avec succès' },
    },
  })
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(+id);
  }
}
