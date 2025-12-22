import { useQuery } from '@tanstack/react-query';
import { ProgramFetchDataService } from '../../services/programService';
import type { Program } from '../../../types/program.type';

/**
 * Hook pour récupérer les programmes ARCHIVÉS de l'ut

ilisateur
 * Lazy-loaded : n'est appelé que lorsque l'utilisateur affiche l'onglet "Archivés"
 */
export function useArchivedPrograms(enabled: boolean = true) {
  return useQuery<Program[], unknown>({
    queryKey: ['program', 'archived'],
    queryFn: () => ProgramFetchDataService.getArchivedPrograms(),
    enabled, // Permet de contrôler quand la requête est exécutée
  });
}

export default useArchivedPrograms;
