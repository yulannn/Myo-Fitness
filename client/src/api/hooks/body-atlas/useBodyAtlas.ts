import { useQuery } from '@tanstack/react-query';
import BodyAtlasService from '../../services/bodyAtlasService';
import { useBodyAtlasStore } from '../../../store/useBodyAtlasStore';

/**
 * 🎯 Hook pour récupérer le Body Atlas de l'utilisateur
 */
export function useBodyAtlas() {
    const { setAtlasData, setLoading, setError, shouldRefetch } = useBodyAtlasStore();

    return useQuery({
        queryKey: ['body-atlas'],
        queryFn: async () => {
            setLoading(true);
            try {
                const data = await BodyAtlasService.getMyBodyAtlas();
                setAtlasData(data);
                setLoading(false);
                return data;
            } catch (error: any) {
                setError(error.message || 'Erreur lors du chargement du Body Atlas');
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes 5
        enabled: shouldRefetch(), // Ne refetch que si nécessaire
    });
}



/**
 * 🤝 Hook pour comparer avec un autre utilisateur
 */
export function useCompareAtlas(userId: number) {
    return useQuery({
        queryKey: ['body-atlas', 'compare', userId],
        queryFn: () => BodyAtlasService.compareAtlas(userId),
        enabled: !!userId,
    });
}
