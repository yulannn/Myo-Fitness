import { useMemo, useState } from 'react';
import { FireIcon } from '@heroicons/react/24/solid';

interface MuscleData {
  name: string;
  intensity: number;
  lastWorked?: string;
  sessionCount: number;
}

interface MuscleHeatmapProps {
  sessions: any[];
}

const muscleGroupMapping: Record<string, string[]> = {
  'Pectoraux': ['pec-left', 'pec-right'],
  'Dorsaux': ['lat-left', 'lat-right', 'trap-left', 'trap-right'],
  'Épaules': ['delt-left', 'delt-right'],
  'Biceps': ['bicep-left', 'bicep-right'],
  'Triceps': ['tricep-left', 'tricep-right'],
  'Abdominaux': ['abs-upper', 'abs-mid', 'abs-lower'],
  'Obliques': ['oblique-left', 'oblique-right'],
  'Quadriceps': ['quad-left', 'quad-right'],
  'Ischio-jambiers': ['ham-left', 'ham-right'],
  'Fessiers': ['glute-left', 'glute-right'],
  'Mollets': ['calf-left', 'calf-right'],
  // Aliases
  'Dos': ['lat-left', 'lat-right', 'trap-left', 'trap-right'],
  'Chest': ['pec-left', 'pec-right'],
  'Shoulders': ['delt-left', 'delt-right'],
  'Back': ['lat-left', 'lat-right', 'trap-left', 'trap-right'],
  'Avant-bras': ['bicep-left', 'bicep-right'],
  'Trapèzes': ['trap-left', 'trap-right'],
  'Lombaires': ['lat-left', 'lat-right'],
  'Tronc': ['abs-upper', 'abs-mid', 'abs-lower', 'oblique-left', 'oblique-right'],
};

const getIntensityColor = (intensity: number): string => {
  if (intensity === 0) return 'rgba(148, 251, 221, 0.08)';
  if (intensity < 25) return 'rgba(148, 251, 221, 0.3)';
  if (intensity < 50) return 'rgba(148, 251, 221, 0.5)';
  if (intensity < 75) return 'rgba(148, 251, 221, 0.7)';
  return 'rgba(148, 251, 221, 0.9)';
};

export default function MuscleHeatmap({ sessions }: MuscleHeatmapProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  const muscleIntensities = useMemo(() => {
    const muscleData: Record<string, MuscleData> = {};
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    Object.keys(muscleGroupMapping).forEach(muscle => {
      if (!muscleData[muscle]) {
        muscleData[muscle] = { name: muscle, intensity: 0, sessionCount: 0 };
      }
    });

    if (!sessions || sessions.length === 0) return muscleData;

    const completedSessions = sessions.filter(s => {
      if (!s.completed || !s.performedAt) return false;
      const sessionDate = new Date(s.performedAt);
      return sessionDate >= sevenDaysAgo;
    });

    let maxCount = 0;

    completedSessions.forEach(session => {
      if (!session.exercices) return;
      session.exercices.forEach((exerciceSession: any) => {
        const exercice = exerciceSession.exercice;
        if (!exercice?.muscleGroups) return;
        let groups: string[] = [];
        if (Array.isArray(exercice.muscleGroups)) {
          groups = exercice.muscleGroups.map((g: any) =>
            typeof g === 'string' ? g : g.groupe?.name || g.name || ''
          ).filter(Boolean);
        }
        groups.forEach((group: string) => {
          if (muscleData[group]) {
            muscleData[group].sessionCount += 1;
            muscleData[group].lastWorked = session.performedAt;
            maxCount = Math.max(maxCount, muscleData[group].sessionCount);
          }
        });
      });
    });

    if (maxCount > 0) {
      Object.keys(muscleData).forEach(muscle => {
        muscleData[muscle].intensity = Math.round((muscleData[muscle].sessionCount / maxCount) * 100);
      });
    }

    return muscleData;
  }, [sessions]);

  const getIntensityForMuscle = (muscleId: string): number => {
    for (const [muscle, ids] of Object.entries(muscleGroupMapping)) {
      if (ids.includes(muscleId) && muscleIntensities[muscle]) {
        return muscleIntensities[muscle].intensity;
      }
    }
    return 0;
  };

  const getMuscleNameForId = (muscleId: string): string | null => {
    for (const [muscle, ids] of Object.entries(muscleGroupMapping)) {
      if (ids.includes(muscleId)) return muscle;
    }
    return null;
  };

  const stats = useMemo(() => {
    const muscles = Object.values(muscleIntensities);
    const worked = muscles.filter(m => m.intensity > 0);
    const totalIntensity = muscles.reduce((sum, m) => sum + m.intensity, 0);
    const avgIntensity = muscles.length > 0 ? totalIntensity / muscles.length : 0;
    const mostWorked = muscles.reduce((max, m) => m.intensity > max.intensity ? m : max,
      { name: '-', intensity: 0, sessionCount: 0 });

    return {
      workedCount: worked.length,
      avgIntensity: Math.round(avgIntensity),
      mostWorked: mostWorked.name,
      mostWorkedIntensity: mostWorked.intensity,
    };
  }, [muscleIntensities]);

  const handleMuscleClick = (muscleId: string) => {
    const muscleName = getMuscleNameForId(muscleId);
    setSelectedMuscle(selectedMuscle === muscleName ? null : muscleName);
  };

  const handleMuscleHover = (muscleId: string | null) => {
    setHoveredMuscle(muscleId ? getMuscleNameForId(muscleId) : null);
  };

  const renderMuscle = (id: string, d: string) => {
    const intensity = getIntensityForMuscle(id);
    const isActive = hoveredMuscle === getMuscleNameForId(id) || selectedMuscle === getMuscleNameForId(id);

    return (
      <path
        key={id}
        id={id}
        d={d}
        fill={getIntensityColor(intensity)}
        stroke={isActive ? '#94fbdd' : 'rgba(148, 251, 221, 0.25)'}
        strokeWidth={isActive ? 1.8 : 0.8}
        strokeLinejoin="round"
        style={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: isActive ? 'drop-shadow(0 0 16px rgba(148, 251, 221, 0.6))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
        }}
        onClick={() => handleMuscleClick(id)}
        onMouseEnter={() => handleMuscleHover(id)}
        onMouseLeave={() => handleMuscleHover(null)}
      />
    );
  };

  const displayedMuscle = hoveredMuscle || selectedMuscle;
  const displayedData = displayedMuscle ? muscleIntensities[displayedMuscle] : null;

  return (
    <div className="bg-gradient-to-br from-[#1a1a1c] to-[#0f0f10] rounded-3xl border border-[#94fbdd]/20 overflow-hidden shadow-2xl">
      <div className="p-5 sm:p-6 border-b border-[#94fbdd]/10 bg-[#1a1a1c]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gradient-to-br from-[#94fbdd]/20 to-[#94fbdd]/10 rounded-xl">
            <FireIcon className="h-6 w-6 text-[#94fbdd]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Atlas Musculaire</h3>
            <p className="text-xs text-gray-400">Analyse hebdomadaire</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#252527]/80 backdrop-blur-sm rounded-xl p-3 text-center border border-[#94fbdd]/10">
            <div className="text-xl font-bold text-[#94fbdd]">{stats.workedCount}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Zones</div>
          </div>
          <div className="bg-[#252527]/80 backdrop-blur-sm rounded-xl p-3 text-center border border-[#94fbdd]/10">
            <div className="text-xl font-bold text-white">{stats.avgIntensity}%</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Moy.</div>
          </div>
          <div className="bg-[#252527]/80 backdrop-blur-sm rounded-xl p-3 text-center border border-[#94fbdd]/10">
            <div className="text-xl font-bold text-orange-400">{stats.mostWorkedIntensity}%</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Max</div>
          </div>
        </div>
      </div>

      <div className="relative p-8 sm:p-10">
        <div className="flex justify-center items-start gap-12 sm:gap-20">
          {/* FRONT VIEW - Aesthetic muscle shapes */}
          <div className="relative group">
            <div className="text-[10px] text-gray-500 text-center mb-4 uppercase tracking-[0.2em] font-bold opacity-60">
              Face
            </div>
            <svg viewBox="0 0 140 360" className="w-28 sm:w-36 h-auto">
              {/* Head */}
              <circle cx="70" cy="22" r="18" fill="rgba(148, 251, 221, 0.05)" stroke="rgba(148, 251, 221, 0.15)" strokeWidth="1" />

              {/* Neck */}
              <path d="M 60 38 L 58 50 L 82 50 L 80 38" fill="rgba(148, 251, 221, 0.04)" stroke="none" />

              {/* DELTOIDS - Rounded shoulder caps */}
              {renderMuscle('delt-left', 'M 42 50 Q 32 53 28 64 Q 26 75 30 86 L 46 82 Q 50 70 52 60 Z')}
              {renderMuscle('delt-right', 'M 98 50 Q 108 53 112 64 Q 114 75 110 86 L 94 82 Q 90 70 88 60 Z')}

              {/* PECTORALS - Fan shape with definition */}
              {renderMuscle('pec-left', 'M 52 60 L 58 56 L 70 58 L 70 88 Q 66 96 58 100 Q 48 94 44 84 Q 46 72 48 64 Z')}
              {renderMuscle('pec-right', 'M 88 60 L 82 56 L 70 58 L 70 88 Q 74 96 82 100 Q 92 94 96 84 Q 94 72 92 64 Z')}

              {/* BICEPS - Muscle belly shape */}
              {renderMuscle('bicep-left', 'M 30 86 Q 26 94 24 108 Q 24 128 26 145 L 36 143 Q 38 124 38 108 Q 36 96 32 88 Z')}
              {renderMuscle('bicep-right', 'M 110 86 Q 114 94 116 108 Q 116 128 114 145 L 104 143 Q 102 124 102 108 Q 104 96 108 88 Z')}

              {/* Forearms */}
              <path d="M 26 145 L 36 143 L 36 168 L 28 170 Q 24 158 26 145" fill="rgba(148, 251, 221, 0.06)" stroke="rgba(148, 251, 221, 0.15)" strokeWidth="0.8" />
              <path d="M 114 145 L 104 143 L 104 168 L 112 170 Q 116 158 114 145" fill="rgba(148, 251, 221, 0.06)" stroke="rgba(148, 251, 221, 0.15)" strokeWidth="0.8" />

              {/* RECTUS ABDOMINIS - 6-pack definition */}
              {renderMuscle('abs-upper', 'M 58 100 L 64 100 Q 66 106 66 112 L 64 118 L 58 118 Q 56 112 56 106 Z')}
              {renderMuscle('abs-upper', 'M 82 100 L 76 100 L 76 118 L 82 118 Q 84 112 84 106 Z')}

              {renderMuscle('abs-mid', 'M 58 120 L 64 120 Q 66 126 66 132 L 64 138 L 58 138 Q 56 132 56 126 Z')}
              {renderMuscle('abs-mid', 'M 82 120 L 76 120 L 76 138 L 82 138 Q 84 132 84 126 Z')}

              {renderMuscle('abs-lower', 'M 59 140 L 65 140 Q 67 146 67 152 L 65 158 L 59 158 Q 57 152 57 146 Z')}
              {renderMuscle('abs-lower', 'M 81 140 L 75 140 L 75 158 L 81 158 Q 83 152 83 146 Z')}

              {/* EXTERNAL OBLIQUES */}
              {renderMuscle('oblique-left', 'M 44 100 Q 40 108 38 122 L 38 150 Q 42 158 50 164 L 57 158 L 58 120 Q 54 108 48 102 Z')}
              {renderMuscle('oblique-right', 'M 96 100 Q 100 108 102 122 L 102 150 Q 98 158 90 164 L 83 158 L 82 120 Q 86 108 92 102 Z')}

              {/* Hip transition */}
              <path d="M 50 164 Q 58 172 70 174 Q 82 172 90 164 L 90 182 Q 82 188 70 190 Q 58 188 50 182 Z"
                fill="rgba(148, 251, 221, 0.04)" stroke="none" />

              {/* QUADRICEPS - Defined thigh muscles */}
              {renderMuscle('quad-left', 'M 48 184 Q 42 194 38 214 Q 36 245 40 272 L 52 270 Q 56 242 58 214 Q 56 196 52 186 Z')}
              {renderMuscle('quad-right', 'M 92 184 Q 98 194 102 214 Q 104 245 100 272 L 88 270 Q 84 242 82 214 Q 84 196 88 186 Z')}

              {/* Knees */}
              <circle cx="46" cy="279" r="7" fill="rgba(148, 251, 221, 0.04)" stroke="rgba(148, 251, 221, 0.12)" strokeWidth="0.8" />
              <circle cx="94" cy="279" r="7" fill="rgba(148, 251, 221, 0.04)" stroke="rgba(148, 251, 221, 0.12)" strokeWidth="0.8" />

              {/* CALVES - Diamond shape */}
              {renderMuscle('calf-left', 'M 42 288 Q 38 298 36 316 Q 38 336 46 346 Q 52 340 54 328 Q 54 308 50 296 Q 46 290 42 288')}
              {renderMuscle('calf-right', 'M 98 288 Q 102 298 104 316 Q 102 336 94 346 Q 88 340 86 328 Q 86 308 90 296 Q 94 290 98 288')}
            </svg>
          </div>

          {/* BACK VIEW - Aesthetic muscle definition */}
          <div className="relative group">
            <div className="text-[10px] text-gray-500 text-center mb-4 uppercase tracking-[0.2em] font-bold opacity-60">
              Dos
            </div>
            <svg viewBox="0 0 140 360" className="w-28 sm:w-36 h-auto">
              {/* Head */}
              <circle cx="70" cy="22" r="18" fill="rgba(148, 251, 221, 0.05)" stroke="rgba(148, 251, 221, 0.15)" strokeWidth="1" />

              {/* Neck */}
              <path d="M 60 38 L 58 50 L 82 50 L 80 38" fill="rgba(148, 251, 221, 0.04)" stroke="none" />

              {/* TRAPEZIUS - Upper diamond */}
              {renderMuscle('trap-left', 'M 58 50 Q 50 54 44 62 Q 42 72 44 84 L 58 88 L 68 74 L 70 58 Z')}
              {renderMuscle('trap-right', 'M 82 50 Q 90 54 96 62 Q 98 72 96 84 L 82 88 L 72 74 L 70 58 Z')}

              {/* POSTERIOR DELTOIDS */}
              {renderMuscle('delt-left', 'M 44 62 Q 34 65 30 76 Q 28 87 32 98 L 48 94 Q 50 82 48 70 Z')}
              {renderMuscle('delt-right', 'M 96 62 Q 106 65 110 76 Q 112 87 108 98 L 92 94 Q 90 82 92 70 Z')}

              {/* LATISSIMUS DORSI - V-shape with definition */}
              {renderMuscle('lat-left', 'M 44 84 L 58 88 L 68 92 L 70 122 Q 68 145 60 162 Q 50 172 40 168 Q 34 154 30 136 Q 28 112 34 94 Q 38 88 44 84 Z')}
              {renderMuscle('lat-right', 'M 96 84 L 82 88 L 72 92 L 70 122 Q 72 145 80 162 Q 90 172 100 168 Q 106 154 110 136 Q 112 112 106 94 Q 102 88 96 84 Z')}

              {/* TRICEPS - Back of arm */}
              {renderMuscle('tricep-left', 'M 32 98 Q 28 106 26 120 Q 26 138 28 152 L 38 150 Q 40 132 40 120 Q 38 108 34 100 Z')}
              {renderMuscle('tricep-right', 'M 108 98 Q 112 106 114 120 Q 114 138 112 152 L 102 150 Q 100 132 100 120 Q 102 108 106 100 Z')}

              {/* Forearms */}
              <path d="M 28 152 L 38 150 L 38 175 L 30 177 Q 26 165 28 152" fill="rgba(148, 251, 221, 0.06)" stroke="rgba(148, 251, 221, 0.15)" strokeWidth="0.8" />
              <path d="M 112 152 L 102 150 L 102 175 L 110 177 Q 114 165 112 152" fill="rgba(148, 251, 221, 0.06)" stroke="rgba(148, 251, 221, 0.15)" strokeWidth="0.8" />

              {/* Lower back / Erector Spinae */}
              <path d="M 60 162 Q 64 168 70 170 Q 76 168 80 162 L 80 178 Q 76 184 70 186 Q 64 184 60 178 Z"
                fill="rgba(148, 251, 221, 0.08)" stroke="rgba(148, 251, 221, 0.2)" strokeWidth="0.8" />

              {/* GLUTEUS - Rounded shape */}
              {renderMuscle('glute-left', 'M 52 178 Q 44 186 40 200 Q 38 218 42 234 Q 48 246 58 252 L 70 246 Q 74 228 74 210 Q 72 192 66 182 Q 60 178 52 178')}
              {renderMuscle('glute-right', 'M 88 178 Q 96 186 100 200 Q 102 218 98 234 Q 92 246 82 252 L 70 246 Q 66 228 66 210 Q 68 192 74 182 Q 80 178 88 178')}

              {/* HAMSTRINGS - Back of thigh */}
              {renderMuscle('ham-left', 'M 48 254 Q 42 264 38 284 Q 36 310 40 334 L 52 332 Q 56 308 58 284 Q 56 266 52 256 Z')}
              {renderMuscle('ham-right', 'M 92 254 Q 98 264 102 284 Q 104 310 100 334 L 88 332 Q 84 308 82 284 Q 84 266 88 256 Z')}

              {/* Knees */}
              <circle cx="46" cy="341" r="7" fill="rgba(148, 251, 221, 0.04)" stroke="rgba(148, 251, 221, 0.12)" strokeWidth="0.8" />
              <circle cx="94" cy="341" r="7" fill="rgba(148, 251, 221, 0.04)" stroke="rgba(148, 251, 221, 0.12)" strokeWidth="0.8" />

              {/* CALVES */}
              {renderMuscle('calf-left', 'M 42 350 Q 38 360 36 378 Q 38 398 46 408 Q 52 402 54 390 Q 54 370 50 358 Q 46 352 42 350')}
              {renderMuscle('calf-right', 'M 98 350 Q 102 360 104 378 Q 102 398 94 408 Q 88 402 86 390 Q 86 370 90 358 Q 94 352 98 350')}
            </svg>
          </div>
        </div>

        {/* Tooltip */}
        {displayedMuscle && displayedData && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#252527] via-[#1f1f21] to-[#1a1a1c] border border-[#94fbdd]/40 rounded-2xl px-6 py-4 min-w-[220px] animate-fadeIn shadow-2xl backdrop-blur-md z-20">
            <div className="text-center">
              <div className="text-sm font-bold text-white mb-2.5 tracking-wide">{displayedMuscle}</div>
              <div className="flex items-center justify-center gap-3.5">
                <div className="relative w-28 h-3 bg-[#0f0f10] rounded-full overflow-hidden border border-[#94fbdd]/20 shadow-inner">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-[#94fbdd]/60 via-[#94fbdd]/80 to-[#94fbdd] rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${displayedData.intensity}%`,
                      boxShadow: '0 0 12px rgba(148, 251, 221, 0.5)'
                    }}
                  />
                </div>
                <span className="text-base font-bold text-[#94fbdd] tabular-nums min-w-[42px]">{displayedData.intensity}%</span>
              </div>
              {displayedData.sessionCount > 0 && (
                <div className="text-[11px] text-gray-400 mt-2.5 font-medium">
                  {displayedData.sessionCount} séance{displayedData.sessionCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 bg-[#0f0f10]/50 border-t border-[#94fbdd]/10">
        <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-[#94fbdd]/30" style={{ backgroundColor: 'rgba(148, 251, 221, 0.08)' }} />
            <span>Repos</span>
          </div>
          <div className="w-28 h-4 rounded bg-gradient-to-r from-[rgba(148,251,221,0.08)] via-[rgba(148,251,221,0.5)] to-[rgba(148,251,221,0.9)] border border-[#94fbdd]/20 shadow-lg" />
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-[#94fbdd]" style={{ backgroundColor: 'rgba(148, 251, 221, 0.9)', boxShadow: '0 0 8px rgba(148, 251, 221, 0.5)' }} />
            <span>Intensif</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-500 mt-3 font-medium">
          Cliquez pour afficher les statistiques détaillées
        </p>
      </div>
    </div>
  );
}
