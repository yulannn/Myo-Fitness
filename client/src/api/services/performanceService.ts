import api from '../apiClient';
import type { Performance, CreatePerformancePayload, UpdatePerformancePayload } from '../../types/performance.type';

export const PerformanceFetchDataService = {
    async createPerformance(payload: CreatePerformancePayload): Promise<Performance> {
        const res = await api.post<Performance>('/performance', payload);
        return res.data;
    },

    async getPerformancesByUserId(userId: number): Promise<Performance[]> {
        const res = await api.get<Performance[]>(`/performance/user/${userId}`);
        return res.data;
    },

    async getPerformanceById(performanceId: number): Promise<Performance> {
        const res = await api.get<Performance>(`/performance/${performanceId}`);
        return res.data;
    },

    async updatePerformance(performanceId: number, payload: UpdatePerformancePayload): Promise<Performance> {
        const res = await api.patch<Performance>(`/performance/${performanceId}`, payload);
        return res.data;
    },

    async deletePerformance(performanceId: number): Promise<{ message: string }> {
        const res = await api.delete<{ message: string }>(`/performance/${performanceId}`);
        return res.data;
    },
};

export default PerformanceFetchDataService;

