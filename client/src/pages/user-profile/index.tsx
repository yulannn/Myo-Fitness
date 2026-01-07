import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UsersIcon, UserCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { usePublicProfile } from '../../api/hooks/user/usePublicProfile';
import { getImageUrl } from '../../utils/imageUtils';


/**
 * 🔒 Page de profil utilisateur sécurisée
 * 
 * Utilise l'endpoint /users/:id/public-profile pour afficher
 * uniquement les données publiques non-sensibles des autres utilisateurs
 */
export default function UserProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    // 🔒 Utilise le hook de profil PUBLIC sécurisé
    const { data: user, isLoading, error } = usePublicProfile(userId ? parseInt(userId) : undefined);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#121214] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#94fbdd] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-[#121214] flex items-center justify-center px-4">
                <div className="text-center">
                    <UsersIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Utilisateur introuvable</h2>
                    <p className="text-gray-400 mb-6">Cet utilisateur n'existe pas ou a été supprimé.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-[#94fbdd] text-[#121214] rounded-lg font-semibold hover:bg-[#7dfbc9] transition-colors"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Récemment';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
    };

    return (
        <div className="min-h-screen bg-[#121214] pb-20">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-6 left-6 z-30 flex items-center gap-2 text-gray-400 hover:text-[#94fbdd] transition-colors"
            >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Retour</span>
            </button>

            <div className="max-w-4xl mx-auto px-4 pt-24 pb-8 space-y-6">
                {/* User Card */}
                <div className="bg-gradient-to-br from-[#18181b] to-[#27272a] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                            {/* Profile Picture */}
                            <div className="relative flex-shrink-0">
                                <div className="relative h-28 w-28 md:h-32 md:w-32">
                                    {user.profilePictureUrl ? (
                                        <img
                                            src={getImageUrl(user.profilePictureUrl)}
                                            alt={user.name}
                                            className="h-full w-full rounded-2xl object-cover ring-2 ring-white/10 shadow-xl"
                                        />
                                    ) : (
                                        <div className="h-full w-full rounded-2xl bg-[#27272a] flex items-center justify-center ring-2 ring-white/10">
                                            <UsersIcon className="h-16 w-16 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left space-y-3">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                                        {user.name}
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            Membre depuis {formatDate(user.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
                                    <div className="px-3 py-1 bg-[#27272a] border border-white/5 rounded-lg flex items-center gap-2">
                                        <UserCircleIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs font-medium text-gray-300">Membre actif</span>
                                    </div>
                                    {user.friendCode && (
                                        <div className="px-3 py-1 bg-[#94fbdd]/10 border border-[#94fbdd]/20 rounded-lg">
                                            <span className="text-xs font-mono font-bold text-[#94fbdd] tracking-wider">
                                                {user.friendCode}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Level & XP Card */}
                {(user.level !== undefined || user.xp !== undefined) && (
                    <div className="bg-[#18181b] rounded-xl border border-white/5 p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
                            Niveau & Progression
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Niveau actuel</p>
                                    <p className="text-3xl font-bold text-white">{user.level || 1}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Expérience</p>
                                    <p className="text-2xl font-bold text-[#94fbdd]">{user.xp || 0} XP</p>
                                </div>
                            </div>
                            {/* Barre de progression basée sur les données publiques */}
                            <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#94fbdd] to-[#7dfbc9] rounded-full transition-all duration-500"
                                    style={{ width: `${((user.xp || 0) % 200) / 2}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                {200 - ((user.xp || 0) % 200)} XP jusqu'au niveau {(user.level || 1) + 1}
                            </p>
                        </div>
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-[#18181b] rounded-xl border border-white/5 p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
                        À propos
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-[#27272a] rounded-lg">
                            <UserCircleIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nom d'utilisateur</p>
                                <p className="text-white font-medium">{user.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
