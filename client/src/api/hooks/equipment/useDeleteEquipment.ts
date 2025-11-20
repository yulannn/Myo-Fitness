import { useMutation, useQueryClient } from '@tanstack/react-query';
import EquipmentService from '../../services/equipmentService';

export function useDeleteEquipment() {
    const qc = useQueryClient();

    return useMutation<{ message: string }, unknown, number>({
        mutationFn: (equipmentId: number) => EquipmentService.deleteEquipment(equipmentId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['equipments'] });
        }
    });
}

export default useDeleteEquipment;

