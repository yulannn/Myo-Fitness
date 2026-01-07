import api from '../apiClient';
import type { UserBadge } from '../../types/badge.type';

const BadgeService = {
    getMyBadges: async (): Promise<UserBadge[]> => {
        const response = await api.get('/badges/my-badges');
        return response.data;
    },
};

export default BadgeService;
