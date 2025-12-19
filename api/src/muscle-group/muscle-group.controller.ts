import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MuscleGroupService } from './muscle-group.service';
import { MuscleGroupEntity } from './entities/muscle-group.entity';

@ApiTags('Muscle Groups')
@Controller('api/v1/muscle-groups')
export class MuscleGroupController {
    constructor(private readonly muscleGroupService: MuscleGroupService) { }

    @Get()
    @ApiOperation({
        summary: 'Récupérer tous les groupes musculaires',
        description: 'Retourne la liste complète des groupes musculaires disponibles, ordonnés par catégorie',
    })
    @ApiResponse({
        status: 200,
        description: 'Liste des groupes musculaires récupérée avec succès',
        type: [MuscleGroupEntity],
    })
    async findAll(): Promise<MuscleGroupEntity[]> {
        return this.muscleGroupService.findAll();
    }
}
