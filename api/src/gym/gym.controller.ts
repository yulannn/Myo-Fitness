import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GymService } from './gym.service';
import { FindOrCreateGymDto } from './dto/gym.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/gym')
@UseGuards(AuthGuard('jwt'))
export class GymController {
    constructor(private readonly gymService: GymService) { }

    /**
     * Trouve ou crée une salle de sport
     * POST /gym/find-or-create
     */
    @Post('find-or-create')
    async findOrCreate(@Body() dto: FindOrCreateGymDto) {
        return this.gymService.findOrCreate(dto);
    }

    /**
     * Récupère les détails d'une salle (membres + séances)
     * GET /gym/:id/details
     */
    @Get(':id/details')
    async getGymDetails(@Param('id', ParseIntPipe) id: number) {
        return this.gymService.getGymDetails(id);
    }

    /**
     * Récupère une salle par son OSM ID
     * GET /gym/osm/:osmId
     */
    @Get('osm/:osmId')
    async findByOsmId(@Param('osmId') osmId: string) {
        return this.gymService.findByOsmId(osmId);
    }

    /**
     * Récupère les salles à proximité
     * GET /gym/nearby?lat=48.8566&lng=2.3522&radius=5
     */
    @Get('nearby')
    async findNearby(
        @Query('lat') lat: string,
        @Query('lng') lng: string,
        @Query('radius') radius?: string,
    ) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusKm = radius ? parseFloat(radius) : 5;

        return this.gymService.findNearby(latitude, longitude, radiusKm);
    }

    /**
     * Nettoie manuellement les salles inutilisées
     * POST /gym/cleanup
     */
    @Post('cleanup')
    async manualCleanup() {
        return this.gymService.manualCleanupUnusedGyms();
    }
}
