import { Controller, Get, Param, UseGuards, Req, Logger } from '@nestjs/common';
import { BodyAtlasService } from './body-atlas.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/body-atlas')
@UseGuards(AuthGuard('jwt'))
export class BodyAtlasController {
  private readonly logger = new Logger(BodyAtlasController.name);

  constructor(private readonly bodyAtlasService: BodyAtlasService) {}

  /**
   *  GET /body-atlas
   * Récupère le Body Atlas complet de l'utilisateur connecté
   */
  @Get()
  async getMyBodyAtlas(@Req() req: any) {
    const userId = req.user.id;
    this.logger.log(`GET /body-atlas - User ${userId}`);
    return this.bodyAtlasService.getBodyAtlasData(userId);
  }

  /**
   *  GET /body-atlas/:userId
   * Récupère le Body Atlas d'un autre utilisateur (pour comparaison)
   */
  @Get(':userId')
  async getBodyAtlas(@Param('userId') userId: string) {
    this.logger.log(`GET /body-atlas/${userId}`);
    return this.bodyAtlasService.getBodyAtlasData(parseInt(userId));
  }

  /**
   *  GET /body-atlas/compare/:userId
   * Compare ton Body Atlas avec un autre utilisateur
   */
  @Get('compare/:userId')
  async compareAtlas(@Req() req: any, @Param('userId') targetUserId: string) {
    const myUserId = req.user.id;
    this.logger.log(
      `GET /body-atlas/compare/${targetUserId} - User ${myUserId}`,
    );
    return this.bodyAtlasService.compareAtlas(myUserId, parseInt(targetUserId));
  }
}
