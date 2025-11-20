import { useMutation, useQueryClient } from '@tanstack/react-query';
import EquipmentService from '../../services/equipmentService';
import type { Equipment, UpdateEquipmentPayload } from '../../../types/equipment.type';

export function useUpdateEquipment(equipmentId?: number) {
    const qc = useQueryClient();

    return useMutation<Equipment, unknown, UpdateEquipmentPayload>({
        mutationFn: (payload: UpdateEquipmentPayload) => EquipmentService.updateEquipment(equipmentId as number, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['equipments'] });
            if (equipmentId) qc.invalidateQueries({ queryKey: ['equipment', equipmentId] });
        }
    });
}

export default useUpdateEquipment;

