import { useQuery } from '@tanstack/react-query';
import { ExerciceFetchDataService } from '../../services/exerciceService';
import type { Exercice } from '../../../types/exercice.type';

export function useExercicesByUser() {
    return useQuery<Exercice[], unknown>({
        queryKey: ['exercices'],
        queryFn: () => ExerciceFetchDataService.getExercicesByUser(),
    });
}

export default useExercicesByUser;

