import { useQuery } from '@tanstack/react-query';
import EquipmentService from '../../services/equipmentService';
import type { Equipment } from '../../../types/equipment.type';

export function useEquipmentById(equipmentId: number | undefined) {
    return useQuery<Equipment, unknown>({
        queryKey: ['equipment', equipmentId],
        queryFn: () => EquipmentService.getEquipmentById(equipmentId as number),
        enabled: typeof equipmentId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useEquipmentById;

