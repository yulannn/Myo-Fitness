import { useQuery } from '@tanstack/react-query';
import { ExerciceFetchDataService } from '../../services/exerciceService';
import type { ExerciceMinimal } from '../../../types/exercice.type';

export function useExercicesMinimal() {
  return useQuery<ExerciceMinimal[], unknown>({
    queryKey: ['exercices', 'minimal'],
    queryFn: () => ExerciceFetchDataService.getExercicesMinimalByUser(),
  });
}

export default useExercicesMinimal;
