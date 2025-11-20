import { useMutation, useQueryClient } from '@tanstack/react-query';
import EquipmentService from '../../services/equipmentService';
import type { Equipment, CreateEquipmentPayload } from '../../../types/equipment.type';

export function useCreateEquipment() {
  const qc = useQueryClient();

  const mutation = useMutation<Equipment, unknown, CreateEquipmentPayload>({
    mutationFn: (payload: CreateEquipmentPayload) => EquipmentService.createEquipment(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['equipments'] });
    },
  });
  return mutation;
}

export default useCreateEquipment;

