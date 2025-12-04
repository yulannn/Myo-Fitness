import api from '../apiClient';
import type { Level, LevelStats } from '../../types/level.type';

export const LevelFetchDataService = {
    async getMyLevel(): Promise<Level> {
        const res = await api.get<Level>('/level/me');
        return res.data;
    },

    async getMyStats(): Promise<LevelStats> {
        const res = await api.get<LevelStats>('/level/me/stats');
        return res.data;
    },

    async initializeMyLeveling(): Promise<Level> {
        const res = await api.post<Level>('/level/initialize');
        return res.data;
    },
};

export default LevelFetchDataService;
