import { useAuth } from '../../context/AuthContext';
import XpBar from '../common/XpBar';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
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
        <div className="relative bg-gradient-to-br from-[#252527] to-[#1a1a1c] rounded-3xl p-6 border border-[#94fbdd]/10 overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#94fbdd]/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#7de3c7]/5 to-transparent rounded-full blur-2xl"></div>

            <div className="relative z-10 space-y-5">
                {/* Top Section: Title + Quick Stats */}
                <div className="flex items-start justify-between gap-4">
                    {/* Left: Welcome Message */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-[#94fbdd] to-[#7de3c7] rounded-full"></div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                {user?.name?.split(' ')[0] || 'Champion'}
                            </h1>
                        </div>
                        <p className="text-sm text-gray-400 ml-3">
                            Ton parcours fitness continue 🔥
                        </p>
                    </div>

                    {/* Right: Quick Stats Pills */}
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#94fbdd]/10 rounded-xl border border-[#94fbdd]/20">
                            <FireIcon className="h-4 w-4 text-[#94fbdd]" />
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Cette semaine</p>
                                <p className="text-sm font-bold text-white">{stats.thisWeekSessions}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#7de3c7]/10 rounded-xl border border-[#7de3c7]/20">
                            <TrophyIcon className="h-4 w-4 text-[#7de3c7]" />
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Total</p>
                                <p className="text-sm font-bold text-white">{stats.completedSessions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* XP Bar - Integrated */}
                <div className="bg-[#121214]/50 backdrop-blur-sm rounded-2xl p-4 border border-[#94fbdd]/10">
                    <XpBar variant="compact" showLevel={true} />
                </div>

                {/* Mobile Quick Stats */}
                <div className="sm:hidden flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-[#94fbdd]/10 rounded-xl border border-[#94fbdd]/20">
                        <FireIcon className="h-4 w-4 text-[#94fbdd]" />
                        <div className="text-left">
                            <p className="text-xs text-gray-400">Semaine</p>
                            <p className="text-sm font-bold text-white">{stats.thisWeekSessions}</p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-[#7de3c7]/10 rounded-xl border border-[#7de3c7]/20">
                        <TrophyIcon className="h-4 w-4 text-[#7de3c7]" />
                        <div className="text-left">
                            <p className="text-xs text-gray-400">Total</p>
                            <p className="text-sm font-bold text-white">{stats.completedSessions}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

