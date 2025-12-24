import { useMemo } from 'react';
import { FireIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weekActivity: boolean[];
  totalCompletedSessions: number;
}

interface StreakTrackerProps {
  streakData?: StreakData;
}

export default function StreakTracker({ streakData }: StreakTrackerProps) {
  // Générer les labels des jours de la semaine
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    });
  }, []);

  if (!streakData) {
    return (
      <div className="bg-gradient-to-br from-[#94fbdd]/10 to-[#252527] rounded-2xl p-6 border border-[#94fbdd]/20 overflow-hidden relative group">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#94fbdd]/20 rounded-xl">
                <FireIcon className="h-6 w-6 text-[#94fbdd]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Série en cours</h3>
                <p className="text-xs text-gray-400">Chargement...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#94fbdd]/10 to-[#252527] rounded-2xl p-6 border border-[#94fbdd]/20 overflow-hidden relative group">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#94fbdd]/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#94fbdd]/20 rounded-xl group-hover:bg-[#94fbdd]/30 transition-colors">
              <FireIcon className="h-6 w-6 text-[#94fbdd]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Série en cours</h3>
              <p className="text-xs text-gray-400">Garde le rythme !</p>
            </div>
          </div>
        </div>

        {/* Current Streak - Big Display */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Animated ring */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#94fbdd"
                strokeOpacity="0.1"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#streakGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(streakData.currentStreak / 30, 1) * 440} 440`}
                className="transition-all duration-1000 drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(148, 251, 221, 0.5))'
                }}
              />
              <defs>
                <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94fbdd" />
                  <stop offset="100%" stopColor="#5cddb8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Streak Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-black text-white mb-1">
                {streakData.currentStreak}
              </div>
              <div className="text-sm text-gray-400 font-medium">
                jour{streakData.currentStreak > 1 ? 's' : ''}
              </div>
              {streakData.currentStreak > 0 && (
                <div className="mt-2">
                  <div className="text-2xl animate-pulse">🔥</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Week Activity Calendar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <p className="text-xs text-gray-400 font-medium">7 derniers jours</p>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {streakData.weekActivity.map((isActive: boolean, index: number) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className={`
                    w-full aspect-square rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${isActive
                      ? 'bg-[#94fbdd] shadow-lg shadow-[#94fbdd]/30 scale-105'
                      : 'bg-[#121214] border-2 border-[#94fbdd]/10'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {isActive && (
                    <svg className="w-4 h-4 text-[#121214]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#94fbdd]' : 'text-gray-600'}`}>
                  {weekDays[index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#94fbdd]/10">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Record personnel</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-[#94fbdd]">
                {streakData.longestStreak}
              </span>
              <span className="text-sm text-gray-400">jours</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Prochain objectif</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-white">
                {Math.max(streakData.longestStreak + 1, 7)}
              </span>
              <span className="text-sm text-gray-400">jours</span>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        {streakData.currentStreak >= 7 && (
          <div className="mt-4 p-3 bg-[#94fbdd]/10 rounded-xl border border-[#94fbdd]/20">
            <p className="text-xs text-center text-[#94fbdd] font-medium">
              🎉 Incroyable ! Tu es sur une série de {streakData.currentStreak} jours !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
