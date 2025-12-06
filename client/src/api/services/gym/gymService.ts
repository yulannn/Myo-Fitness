import api from '../../apiClient';
import type { Gym, GymDetails, FindOrCreateGymDto } from '../../../types/gym.type';

const gymService = {
    /**
     * Trouve ou crée une salle de sport
     */
    async findOrCreate(data: FindOrCreateGymDto): Promise<Gym> {
        const response = await api.post('/gym/find-or-create', data);
        return response.data;
    },

    /**
     * Récupère les détails d'une salle (membres + séances)
     */
    async getGymDetails(gymId: number): Promise<GymDetails> {
        const response = await api.get(`/gym/${gymId}/details`);
        return response.data;
    },

    /**
     * Récupère une salle par son OSM ID
     */
    async findByOsmId(osmId: string): Promise<Gym | null> {
        try {
            const response = await api.get(`/gym/osm/${osmId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    /**
     * Récupère les salles à proximité
     */
    async findNearby(lat: number, lng: number, radius: number = 5): Promise<Gym[]> {
        const response = await api.get(`/gym/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
        return response.data;
    },
};

export default gymService;
