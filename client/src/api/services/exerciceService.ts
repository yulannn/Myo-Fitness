import api from '../apiClient';
import type { Exercice, ExerciceMinimal, CreateExercicePayload, UpdateExercicePayload } from '../../types/exercice.type';

export const ExerciceFetchDataService = {
    async getExercicesByUser(): Promise<Exercice[]> {
        const res = await api.get<Exercice[]>('/exercice');
        return res.data;
    },

    async getExercicesMinimalByUser(): Promise<ExerciceMinimal[]> {
        const res = await api.get<ExerciceMinimal[]>('/exercice/minimal');
        return res.data;
    },

    async getExerciceById(exerciceId: number): Promise<Exercice> {
        const res = await api.get<Exercice>(`/exercice/${exerciceId}`);
        return res.data;
    },

    async createExercice(payload: CreateExercicePayload): Promise<Exercice> {
        const res = await api.post<Exercice>('/exercice', payload);
        return res.data;
    },

    async updateExercice(exerciceId: number, payload: UpdateExercicePayload): Promise<Exercice> {
        const res = await api.patch<Exercice>(`/exercice/${exerciceId}`, payload);
        return res.data;
    },

    async deleteExercice(exerciceId: number): Promise<{ message: string }> {
        const res = await api.delete<{ message: string }>(`/exercice/${exerciceId}`);
        return res.data;
    },

    async addEquipmentToExercice(exerciceId: number, equipmentId: number): Promise<{ exerciceId: number; equipmentId: number }> {
        const res = await api.post<{ exerciceId: number; equipmentId: number }>(`/exercice/${exerciceId}/equipments/${equipmentId}`);
        return res.data;
    },
};

export default ExerciceFetchDataService;

