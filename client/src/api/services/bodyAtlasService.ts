import api from '../apiClient';
import type { BodyAtlasData } from '../../types/body-atlas.type';

export const BodyAtlasService = {
    /**
     * 🎯 Récupère le Body Atlas complet de l'utilisateur connecté
     */
    async getMyBodyAtlas(): Promise<BodyAtlasData> {
        const res = await api.get<BodyAtlasData>('/body-atlas');
        return res.data;
    },

    /**
     * 🎯 Récupère le Body Atlas d'un autre utilisateur
     */
    async getBodyAtlas(userId: number): Promise<BodyAtlasData> {
        const res = await api.get<BodyAtlasData>(`/body-atlas/${userId}`);
        return res.data;
    },

    /**
     * 🤝 Compare ton Body Atlas avec un autre utilisateur
     */
    async compareAtlas(userId: number): Promise<any> {
        const res = await api.get(`/body-atlas/compare/${userId}`);
        return res.data;
    },
};

export default BodyAtlasService;
