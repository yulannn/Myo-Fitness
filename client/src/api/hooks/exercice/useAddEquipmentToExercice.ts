import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExerciceService from '../../services/exerciceService';

export function useAddEquipmentToExercice(exerciceId?: number) {
    const qc = useQueryClient();

    return useMutation<{ exerciceId: number; equipmentId: number }, unknown, number>({
        mutationFn: (equipmentId: number) => ExerciceService.addEquipmentToExercice(exerciceId as number, equipmentId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['exercices'] });
            if (exerciceId) qc.invalidateQueries({ queryKey: ['exercice', exerciceId] });
        }
    });
}

export default useAddEquipmentToExercice;

