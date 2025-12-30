import { useQuery } from '@tanstack/react-query';
import api from '../../apiClient';

export interface CardioExercise {
  id: number;
  name: string;
  imageUrl: string | null;
}

export function useCardioExercises() {
  return useQuery<CardioExercise[]>({
    queryKey: ['exercices', 'cardio'],
    queryFn: async () => {
      const response = await api.get('/exercice/cardio');
      return response.data;
    },
  });
}

export default useCardioExercises;
