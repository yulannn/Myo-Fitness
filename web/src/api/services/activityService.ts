import api from '../apiClient';

export const ActivityService = {
    getFeed: async (page = 1, limit = 20): Promise<any> => {
        const { data } = await api.get('/activity/feed', { params: { page, limit } });
        return data;
    },
};

export default ActivityService;
