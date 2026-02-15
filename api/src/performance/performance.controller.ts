import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { PerformanceEntity } from './entities/performance.entity';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('performance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle série de performance' })
  @ApiBody({ type: CreatePerformanceDto })
  @ApiResponse({
    status: 201,
    description: 'Série créée avec succès',
    type: PerformanceEntity,
  })
  create(@Body() createPerformanceDto: CreatePerformanceDto) {
    return this.performanceService.create(createPerformanceDto);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Récupérer les performances du user' })
  @ApiParam({ name: 'id', description: 'ID du user', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Liste des performances',
    type: [PerformanceEntity],
  })
  findAllPerformanceByUserId(@Param('id') id: string) {
    return this.performanceService.findAllPerformanceByUser(Number(id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une performance par ID' })
  @ApiParam({ name: 'id', description: 'ID de la performance', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Performance trouvée',
    type: PerformanceEntity,
  })
  findOne(@Param('id') id: number) {
    return this.performanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une performance' })
  @ApiParam({ name: 'id', description: 'ID de la performance', example: 1 })
  @ApiBody({ type: UpdatePerformanceDto })
  @ApiResponse({
    status: 200,
    description: 'Performance mise à jour',
    type: PerformanceEntity,
  })
  update(
    @Param('id') id: string,
    @Body() updatePerformanceDto: UpdatePerformanceDto,
  ) {
    return this.performanceService.update(Number(id), updatePerformanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une performance' })
  @ApiParam({ name: 'id', description: 'ID de la performance', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Performance supprimée',
    schema: { example: { message: 'Performance supprimée avec succès' } },
  })
  remove(@Param('id') id: string) {
    return this.performanceService.remove(Number(id));
  }
}
