import api from '../apiClient';
import type { Equipment, CreateEquipmentPayload, UpdateEquipmentPayload } from '../../types/equipment.type';

export const EquipmentFetchDataService = {
    async getAllEquipments(): Promise<Equipment[]> {
        const res = await api.get<Equipment[]>('/equipment');
        return res.data;
    },

    async getEquipmentById(equipmentId: number): Promise<Equipment> {
        const res = await api.get<Equipment>(`/equipment/${equipmentId}`);
        return res.data;
    },

    async createEquipment(payload: CreateEquipmentPayload): Promise<Equipment> {
        const res = await api.post<Equipment>('/equipment', payload);
        return res.data;
    },

    async updateEquipment(equipmentId: number, payload: UpdateEquipmentPayload): Promise<Equipment> {
        const res = await api.patch<Equipment>(`/equipment/${equipmentId}`, payload);
        return res.data;
    },

    async deleteEquipment(equipmentId: number): Promise<{ message: string }> {
        const res = await api.delete<{ message: string }>(`/equipment/${equipmentId}`);
        return res.data;
    },
};

export default EquipmentFetchDataService;

