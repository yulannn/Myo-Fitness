import { useQuery } from '@tanstack/react-query';
import { ProgramFetchDataService } from '../../services/programService';
import type { Program } from '../../../types/program.type';

/**
 * Hook pour récupérer UNIQUEMENT le programme ACTIF de l'utilisateur
 * Optimisé pour le chargement initial de la page
 */
export function useActiveProgram() {
  return useQuery<Program | null, unknown>({
    queryKey: ['program', 'active'],
    queryFn: () => ProgramFetchDataService.getActiveProgram(),
  });
}

export default useActiveProgram;
