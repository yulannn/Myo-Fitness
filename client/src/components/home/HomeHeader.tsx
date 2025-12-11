import { useAuth } from '../../context/AuthContext';
import XpBar from '../common/XpBar';

import { useMemo } from 'react';
import useGetAllUserSessions from '../../api/hooks/session/useGetAllUserSessions';

export default function HomeHeader() {
    const { user } = useAuth();
    const { data: sessions } = useGetAllUserSessions();

    // Calculer les stats rapides
    const stats = useMemo(() => {
        const completedSessions = sessions?.filter((s: any) => s.completed).length || 0;
        const thisWeekSessions = sessions?.filter((s: any) => {
            if (!s.performedAt) return false;
            const sessionDate = new Date(s.performedAt);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return sessionDate >= weekAgo && s.completed;
        }).length || 0;

        return { completedSessions, thisWeekSessions };
    }, [sessions]);

    return (

        <div className="rounded-3xl p-2 sm:p-0">
            <div className="space-y-6">
                {/* Top Section: Title + Quick Stats */}
                <div className="flex items-start justify-between gap-4">
                    {/* Left: Welcome Message */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                {user?.name?.split(' ')[0] || 'Champion'}
                            </h1>
                            <div className="px-2.5 py-1 bg-white/5 rounded-full border border-white/5">
                                <span className="text-xs font-medium text-gray-400">Niveau {stats.completedSessions > 10 ? Math.floor(stats.completedSessions / 10) + 1 : 1}</span>
                            </div>
                        </div>
                        <p className="text-gray-400 mt-1">
                            Prêt pour ta séance du jour ?
                        </p>
                    </div>
                </div>

                {/* XP Bar - Integrated */}
                <div className="p-1">
                    <XpBar variant="compact" showLevel={false} />
                </div>
            </div>
        </div>
    );
}

