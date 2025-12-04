import { useAuth } from '../../context/AuthContext';
import { useGetMyLevel } from '../../api/hooks/level';
import { StarIcon } from '@heroicons/react/24/solid';

export default function HomeHeader() {
    const { user } = useAuth();
    const { data: level, isLoading } = useGetMyLevel();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    const progressPercentage = level ? (level.experience / level.nextLevelExp) * 100 : 0;

    return (
        <div className="flex items-center justify-between gap-4 mb-6">
            {/* Greeting - Left side */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'Champion'}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    Prêt à t'entraîner aujourd'hui ?
                </p>
            </div>

            {/* XP Bar - Right side */}
            {!isLoading && level && (
                <div className="flex items-center gap-2 sm:gap-3 bg-[#252527] border border-[#94fbdd]/20 rounded-2xl p-3 sm:p-4 min-w-[200px] sm:min-w-[280px]">
                    {/* Level Badge */}
                    <div className="relative flex-shrink-0">
                        <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#94fbdd] to-[#6dd4b8] rounded-xl shadow-lg">
                            <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#121214]" />
                            <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-[#121214] border-2 border-[#94fbdd] rounded-full text-[8px] sm:text-[9px] font-bold text-[#94fbdd]">
                                {level.level}
                            </span>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] sm:text-xs font-semibold text-white">Niv. {level.level}</span>
                            <span className="text-[9px] sm:text-[10px] text-gray-400">
                                {level.experience}/{level.nextLevelExp}
                            </span>
                        </div>
                        <div className="relative h-1.5 sm:h-2 bg-[#121214] rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#94fbdd] to-[#6dd4b8] rounded-full transition-all duration-500 shadow-lg shadow-[#94fbdd]/50"
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
