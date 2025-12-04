import { useGetMyStats } from '../../api/hooks/level';
import { StarIcon, TrophyIcon, FireIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function DetailedXPBar() {
    const { data: stats, isLoading } = useGetMyStats();

    if (isLoading) {
        return (
            <div className="bg-[#252527] rounded-3xl p-6 border border-[#94fbdd]/10 animate-pulse">
                <div className="space-y-4">
                    <div className="h-8 bg-[#121214] rounded-xl w-1/3"></div>
                    <div className="h-24 bg-[#121214] rounded-xl"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-20 bg-[#121214] rounded-xl"></div>
                        <div className="h-20 bg-[#121214] rounded-xl"></div>
                        <div className="h-20 bg-[#121214] rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const progressPercentage = stats.progressPercentage || 0;

    return (
        <div className="relative bg-gradient-to-br from-[#252527] via-[#1a1a1c] to-[#121214] rounded-3xl p-6 sm:p-8 border border-[#94fbdd]/20 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#94fbdd]/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#94fbdd]/5 to-transparent rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-[#94fbdd]/10 rounded-xl">
                                <TrophyIcon className="h-6 w-6 text-[#94fbdd]" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">Progression</h2>
                        </div>
                        <p className="text-sm text-gray-400">Continue à t'entraîner pour monter de niveau !</p>
                    </div>

                    {/* Level Badge - Large */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#94fbdd]/30 rounded-3xl blur-xl"></div>
                        <div className="relative flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#94fbdd] to-[#6dd4b8] rounded-3xl shadow-2xl">
                            <StarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#121214] mb-1" />
                            <span className="text-xl sm:text-2xl font-black text-[#121214]">{stats.level}</span>
                        </div>
                    </div>
                </div>

                {/* Main Progress Section */}
                <div className="bg-[#121214]/50 rounded-2xl p-5 sm:p-6 border border-[#94fbdd]/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-[#94fbdd]" />
                            <span className="text-lg sm:text-xl font-bold text-white">
                                Niveau {stats.level}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl sm:text-3xl font-bold text-[#94fbdd]">
                                {stats.experience}
                            </p>
                            <p className="text-xs text-gray-400">/ {stats.nextLevelExp} XP</p>
                        </div>
                    </div>

                    {/* Progress Bar - Large */}
                    <div className="relative h-6 bg-[#252527] rounded-full overflow-hidden border border-[#94fbdd]/10">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#94fbdd] via-[#7de5c8] to-[#6dd4b8] rounded-full transition-all duration-700 ease-out shadow-lg shadow-[#94fbdd]/50"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        >
                        </div>

                        {/* Percentage Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white drop-shadow-lg">
                                {progressPercentage.toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {/* XP to Next Level */}
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <BoltIcon className="h-4 w-4 text-[#94fbdd]" />
                        <p className="text-sm text-gray-400">
                            <span className="font-semibold text-[#94fbdd]">
                                {stats.nextLevelExp - stats.experience} XP
                            </span>
                            {' '}pour le niveau suivant
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Total Sessions */}
                    {stats.totalSessions !== undefined && (
                        <div className="bg-[#121214]/50 rounded-2xl p-4 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-[#94fbdd]/10 rounded-lg">
                                    <FireIcon className="h-4 w-4 text-[#94fbdd]" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white mb-1">{stats.totalSessions}</p>
                            <p className="text-xs text-gray-400 font-medium">Séances</p>
                        </div>
                    )}

                    {/* Total XP Earned */}
                    {stats.totalExperience !== undefined && (
                        <div className="bg-[#121214]/50 rounded-2xl p-4 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-[#94fbdd]/10 rounded-lg">
                                    <ChartBarIcon className="h-4 w-4 text-[#94fbdd]" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white mb-1">{stats.totalExperience}</p>
                            <p className="text-xs text-gray-400 font-medium">XP Total</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
