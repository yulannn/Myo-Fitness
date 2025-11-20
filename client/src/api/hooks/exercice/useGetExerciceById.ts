import { useQuery } from '@tanstack/react-query';
import ExerciceService from '../../services/exerciceService';
import type { Exercice } from '../../../types/exercice.type';

export function useExerciceById(exerciceId: number | undefined) {
    return useQuery<Exercice, unknown>({
        queryKey: ['exercice', exerciceId],
        queryFn: () => ExerciceService.getExerciceById(exerciceId as number),
        enabled: typeof exerciceId === 'number',
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export default useExerciceById;

