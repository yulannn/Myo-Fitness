import { useMemo } from 'react';
import { TrophyIcon, BoltIcon, StarIcon } from '@heroicons/react/24/outline';

interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  improvement: number;
}

interface PersonalRecordsProps {
  sessions: any[];
}

export default function PersonalRecords({ sessions }: PersonalRecordsProps) {
  const records = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    const exerciseRecords: Map<string, PersonalRecord> = new Map();

    sessions.forEach(session => {
      if (!session.exercices || !session.completed) return;

      session.exercices.forEach((exerciceSession: any) => {
        const exerciseName = exerciceSession.exercice?.name || 'Unknown';

        // Calculate max weight * reps for this exercise
        let maxScore = 0;
        let bestWeight = 0;
        let bestReps = 0;

        if (exerciceSession.performances && exerciceSession.performances.length > 0) {
          exerciceSession.performances.forEach((perf: any) => {
            const score = (perf.weight || 0) * (perf.reps_effectuees || 0);
            if (score > maxScore) {
              maxScore = score;
              bestWeight = perf.weight || 0;
              bestReps = perf.reps_effectuees || 0;
            }
          });
        }

        if (maxScore > 0) {
          const existing = exerciseRecords.get(exerciseName);
          const currentScore = bestWeight * bestReps;

          if (!existing || currentScore > (existing.weight * existing.reps)) {
            const improvement = existing
              ? ((currentScore - (existing.weight * existing.reps)) / (existing.weight * existing.reps)) * 100
              : 0;

            exerciseRecords.set(exerciseName, {
              exerciseName,
              weight: bestWeight,
              reps: bestReps,
              date: session.performedAt || session.createdAt,
              improvement
            });
          }
        }
      });
    });

    return Array.from(exerciseRecords.values())
      .sort((a, b) => b.weight * b.reps - a.weight * a.reps)
      .slice(0, 5);
  }, [sessions]);

  if (records.length === 0) {
    return (
      <div className="bg-[#252527] rounded-2xl p-6 border border-[#94fbdd]/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
            <TrophyIcon className="h-5 w-5 text-[#94fbdd]" />
          </div>
          <h3 className="text-lg font-bold text-white">Records Personnels</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-sm">Commence à t'entraîner pour établir tes records !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#252527] rounded-2xl p-6 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
            <TrophyIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Records Personnels</h3>
            <p className="text-xs text-gray-400">Top 5 performances</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-yellow-500/10 rounded-lg">
          <span className="text-sm font-bold text-yellow-400">{records.length} PR</span>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {records.map((record, index) => (
          <div
            key={`${record.exerciseName}-${index}`}
            className="group relative bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all overflow-hidden"
          >
            {/* Rank Badge */}
            <div className="absolute top-2 right-2">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
                ${index === 0
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#121214]'
                  : index === 1
                    ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-[#121214]'
                    : index === 2
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-[#121214]'
                      : 'bg-[#252527] text-gray-400'
                }
              `}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
            </div>

            <div className="pr-10">
              {/* Exercise Name */}
              <div className="flex items-center gap-2 mb-2">
                <BoltIcon className="h-4 w-4 text-[#94fbdd]" />
                <h4 className="font-bold text-white text-sm">{record.exerciseName}</h4>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#94fbdd]">{record.weight}</span>
                  <span className="text-xs text-gray-500">kg</span>
                  <span className="text-gray-600 mx-1">×</span>
                  <span className="text-xl font-bold text-white">{record.reps}</span>
                  <span className="text-xs text-gray-500">reps</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(record.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                  {record.improvement > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded-md">
                      <StarIcon className="h-3 w-3 text-green-400" />
                      <span className="text-xs font-bold text-green-400">
                        +{record.improvement.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Volume */}
                <div className="text-xs text-gray-500">
                  Volume: <span className="font-bold text-gray-400">{(record.weight * record.reps).toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            {index === 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {/* Footer Message */}
      <div className="mt-4 p-3 bg-[#94fbdd]/5 rounded-xl border border-[#94fbdd]/10">
        <p className="text-xs text-center text-gray-400">
          💪 Continue à battre tes records ! Chaque amélioration compte.
        </p>
      </div>
    </div>
  );
}
