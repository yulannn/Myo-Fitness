import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExerciceService from '../../services/exerciceService';

export function useDeleteExercice() {
    const qc = useQueryClient();

    return useMutation<{ message: string }, unknown, number>({
        mutationFn: (exerciceId: number) => ExerciceService.deleteExercice(exerciceId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['exercices'] });
        }
    });
}

export default useDeleteExercice;

