import { useGetMyLevel } from '../../api/hooks/level';
import { StarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function CompactXPBar() {
    const { data: level, isLoading } = useGetMyLevel();

    if (isLoading) {
        return (
            <div className="bg-[#252527] rounded-2xl p-4 border border-[#94fbdd]/10 animate-pulse">
                <div className="h-12 bg-[#121214] rounded-xl"></div>
            </div>
        );
    }

    if (!level) {
        return null;
    }

    const progressPercentage = (level.experience / level.nextLevelExp) * 100;

    return (
        <div className="relative bg-gradient-to-br from-[#252527] to-[#121214] rounded-2xl p-4 border border-[#94fbdd]/20 overflow-hidden group hover:border-[#94fbdd]/40 transition-all">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#94fbdd]/5 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex items-center gap-4">
                {/* Level Badge */}
                <div className="relative">
                    <div className="absolute inset-0 bg-[#94fbdd]/20 rounded-2xl blur-md"></div>
                    <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#94fbdd] to-[#6dd4b8] rounded-2xl shadow-lg">
                        <StarIcon className="h-6 w-6 text-[#121214]" />
                        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 bg-[#121214] border-2 border-[#94fbdd] rounded-full text-[10px] font-bold text-[#94fbdd]">
                            {level.level}
                        </span>
                    </div>
                </div>

                {/* XP Progress */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">Niveau {level.level}</span>
                            <SparklesIcon className="h-4 w-4 text-[#94fbdd] animate-pulse" />
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                            {level.experience} / {level.nextLevelExp} XP
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2.5 bg-[#121214] rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#94fbdd] to-[#6dd4b8] rounded-full transition-all duration-500 ease-out shadow-lg shadow-[#94fbdd]/50"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
