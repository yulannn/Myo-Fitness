import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExerciceService from '../../services/exerciceService';
import type { Exercice, CreateExercicePayload } from '../../../types/exercice.type';

export function useCreateExercice() {
  const qc = useQueryClient();

  const mutation = useMutation<Exercice, unknown, CreateExercicePayload>({
    mutationFn: (payload: CreateExercicePayload) => ExerciceService.createExercice(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['exercices'] });
    },
  });
  return mutation;
}

export default useCreateExercice;

