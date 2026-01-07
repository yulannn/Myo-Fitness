import { useQuery } from '@tanstack/react-query';
import UserService from '../../services/userService';

/**
 * 🔒 Hook sécurisé pour récupérer le profil PUBLIC d'un utilisateur
 * Utilisé pour afficher le profil des amis et autres utilisateurs
 * Retourne uniquement les données non-sensibles (nom, photo, niveau, xp)
 */
export interface PublicProfile {
    id: number;
    name: string;
    profilePictureUrl: string | null;
    level: number;
    xp: number;
    friendCode: string | null;
    createdAt: string;
    userBadges: any[];
}

export function usePublicProfile(userId: number | undefined) {
    return useQuery<PublicProfile, unknown>({
        queryKey: ['publicProfile', userId],
        queryFn: () => UserService.getPublicProfile(userId as number),
        enabled: typeof userId === 'number' && userId > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes - le profil ne change pas souvent
        retry: 1,
    });
}

export default usePublicProfile;
