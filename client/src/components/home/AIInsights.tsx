import {
  LightBulbIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface UserStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
}

interface AIInsightsProps {
  stats?: UserStats;
}

export default function AIInsights({ stats }: AIInsightsProps) {
  if (!stats || stats.completedSessions === 0) {
    return (
      <div className="bg-[#18181b] rounded-2xl p-5 border border-white/5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl flex-shrink-0 bg-zinc-800 text-gray-400">
            <LightBulbIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base mb-1">Analyse en attente</h3>
            <p className="text-sm text-gray-400 leading-snug">
              Complète ta première séance pour obtenir des conseils personnalisés.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Simple message de félicitations basé sur les stats
  const isGoodProgress = stats.completedSessions >= 3;
  const title = isGoodProgress ? 'Bonne régularité' : 'Continue comme ça';
  const message = isGoodProgress
    ? `Tu as complété ${stats.completedSessions} séances. La consistance est la clé du progrès.`
    : `Tu as ${stats.upcomingSessions} séance(s) à venir. Continue sur cette lancée !`;
  const type = isGoodProgress ? 'good' : 'neutral';

  return (
    <div className="bg-[#18181b] rounded-2xl p-5 border border-white/5">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${type === 'good' ? 'bg-[#94fbdd]/10 text-[#94fbdd]' : 'bg-zinc-800 text-gray-400'
          }`}>
          {type === 'good' ? (
            <FireIcon className="h-5 w-5" />
          ) : (
            <LightBulbIcon className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="text-white font-bold text-base mb-1">{title}</h3>
          <p className="text-sm text-gray-400 leading-snug">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
