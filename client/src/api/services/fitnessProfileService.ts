import api from '../apiClient';
import type { FitnessProfile, CreateFitnessProfilePayload, UpdateFitnessProfilePayload } from '../../types/fitness-profile.type';
import type { WeightHistory } from '../../types/weight-history.type';

export const FitnessProfileFetchDataService = {
    async createFitnessProfile(payload: CreateFitnessProfilePayload): Promise<FitnessProfile> {
        const res = await api.post<FitnessProfile>('/fitness-profile', payload);
        return res.data;
    },

    async getFitnessProfilesByUser(): Promise<FitnessProfile> {
        const res = await api.get<FitnessProfile>('/fitness-profile');
        return res.data;
    },

    async getFitnessProfileById(profileId: number): Promise<FitnessProfile> {
        const res = await api.get<FitnessProfile>(`/fitness-profile/${profileId}`);
        return res.data;
    },

    async updateFitnessProfile(profileId: number, payload: UpdateFitnessProfilePayload): Promise<FitnessProfile> {
        const res = await api.patch<FitnessProfile>(`/fitness-profile/${profileId}`, payload);
        return res.data;
    },

    async deleteFitnessProfile(profileId: number): Promise<{ message: string }> {
        const res = await api.delete<{ message: string }>(`/fitness-profile/${profileId}`);
        return res.data;
    },

    async getWeightHistory(): Promise<WeightHistory[]> {
        const res = await api.get<WeightHistory[]>('/fitness-profile/weight-history/me');
        return res.data;
    },
};

export default FitnessProfileFetchDataService;
