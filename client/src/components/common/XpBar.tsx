import { useUserXp } from '../../api/hooks/user/useUserXp';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface XpBarProps {
    variant?: 'compact' | 'full';
    showLevel?: boolean;
}

/**
 * Composant de barre d'XP moderne et animée
 * Affiche le niveau actuel et la progression vers le niveau suivant
 */
export default function XpBar({ variant = 'full', showLevel = true }: XpBarProps) {
    const { data: xpData, isLoading } = useUserXp();

    if (isLoading || !xpData) {
        return null;
    }

    const { level, currentLevelXp, xpForNextLevel } = xpData;
    const progressPercentage = (currentLevelXp / (currentLevelXp + xpForNextLevel)) * 100;

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-3">
                {showLevel && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#94fbdd]/20 to-[#7de3c7]/20 rounded-full border border-[#94fbdd]/30">
                        <SparklesIcon className="h-4 w-4 text-[#94fbdd]" />
                        <span className="text-sm font-bold text-white">Niv. {level}</span>
                    </div>
                )}
                <div className="flex-1 min-w-[100px] max-w-[150px]">
                    <div className="h-2 bg-[#252527] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#252527] border border-[#94fbdd]/20 rounded-2xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-[#94fbdd]/20 to-[#7de3c7]/20 rounded-lg">
                        <SparklesIcon className="h-5 w-5 text-[#94fbdd]" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Niveau</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] bg-clip-text text-transparent">
                            {level}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Prochain niveau</p>
                    <p className="text-sm font-semibold text-white">
                        {currentLevelXp} / {currentLevelXp + xpForNextLevel} XP
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="h-3 bg-[#121214] rounded-full overflow-hidden">
                    {/* Animated gradient fill */}
                    <div
                        className="h-full bg-gradient-to-r from-[#94fbdd] via-[#7de3c7] to-[#94fbdd] bg-[length:200%_100%] animate-gradient rounded-full transition-all duration-700 ease-out shadow-lg shadow-[#94fbdd]/30"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {/* Glow effect */}
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm opacity-50 pointer-events-none"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* XP remaining text */}
            <p className="text-xs text-gray-400 mt-2 text-center">
                {xpForNextLevel} XP pour le niveau {level + 1}
            </p>

            <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
        </div>
    );
}
