import { useQuery } from '@tanstack/react-query';
import { EquipmentFetchDataService } from '../../services/equipmentService';
import type { Equipment } from '../../../types/equipment.type';

export function useEquipments() {
    return useQuery<Equipment[], unknown>({
        queryKey: ['equipments'],
        queryFn: () => EquipmentFetchDataService.getAllEquipments(),
    });
}

export default useEquipments;

