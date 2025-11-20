import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExerciceService from '../../services/exerciceService';
import type { Exercice, UpdateExercicePayload } from '../../../types/exercice.type';

export function useUpdateExercice(exerciceId?: number) {
    const qc = useQueryClient();

    return useMutation<Exercice, unknown, UpdateExercicePayload>({
        mutationFn: (payload: UpdateExercicePayload) => ExerciceService.updateExercice(exerciceId as number, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['exercices'] });
            if (exerciceId) qc.invalidateQueries({ queryKey: ['exercice', exerciceId] });
        }
    });
}

export default useUpdateExercice;

