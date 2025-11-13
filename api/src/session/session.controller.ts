import { Controller, Patch, Param, Body } from '@nestjs/common';
import { SessionService } from './session.service';
import { UpdateSessionDateDto } from './dto/update-session.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('session')
@Controller('api/v1/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

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
  @ApiResponse({ status: 200, description: 'Date de session mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  updateDate(
    @Param('id') id: string,
    @Body() updateSessionDateDto: UpdateSessionDateDto,
  ) {
    return this.sessionService.updateDate(Number(id), updateSessionDateDto);
  }
}
