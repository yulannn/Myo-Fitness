import { useAuth } from '../../context/AuthContext';
import XpBar from '../common/XpBar';
import { useUserXp } from '../../api/hooks/user/useUserXp';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function HomeHeader() {
    const { user } = useAuth();
    const { data: xpData } = useUserXp();

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
                                <span className="text-xs font-medium text-gray-400">Niveau {xpData?.level || 1}</span>
                            </div>
                        </div>
                        <p className="text-gray-400 mt-1">
                            Prêt pour ta séance du jour ?
                        </p>
                    </div>

                    {/* Right: Body Atlas Icon */}
                    <Link
                        to="/body-atlas"
                        className="group relative p-3 bg-gradient-to-br from-[#94fbdd]/10 to-[#94fbdd]/5 border border-[#94fbdd]/20 rounded-xl hover:border-[#94fbdd]/40 transition-all active:scale-95"
                        title="Body Atlas"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-[#94fbdd]/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />

                        <Activity className="relative w-5 h-5 text-[#94fbdd] group-hover:scale-110 transition-transform" />

                        {/* Optional: Badge for notification */}
                        {/* <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
                    </Link>
                </div>

                {/* XP Bar - Integrated */}
                <div className="p-1">
                    <XpBar variant="compact" showLevel={false} />
                </div>
            </div>
        </div>
    );
}

