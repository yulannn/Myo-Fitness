import { useMemo } from 'react';
import {
  LightBulbIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface AIInsightsProps {
  sessions: any[];
  programs: any[];
}

export default function AIInsights({ sessions, programs }: AIInsightsProps) {
  const insight = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        title: 'Analyse en attente',
        message: 'Complète ta première séance pour obtenir des conseils personnalisés.',
        type: 'neutral'
      };
    }

    const last7Days = sessions.filter(s => {
      if (!s.performedAt) return false;
      const date = new Date(s.performedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length;

    if (last7Days >= 3) {
      return {
        title: 'Bonne régularité',
        message: `Tu as maintenu un bon rythme avec ${last7Days} séances cette semaine. La consistance est la clé du progrès.`,
        type: 'good'
      };
    } else if (last7Days >= 1) {
      return {
        title: 'Garde le cap',
        message: 'Essaie d\'ajouter une séance supplémentaire la semaine prochaine pour accélérer tes résultats.',
        type: 'neutral'
      };
    } else {
      return {
        title: 'Reprise',
        message: 'C\'est le moment idéal pour planifier ta prochaine séance et relancer la machine.',
        type: 'neutral'
      };
    }
  }, [sessions]);

  return (
    <div className="bg-[#18181b] rounded-2xl p-5 border border-white/5">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${insight.type === 'good' ? 'bg-[#94fbdd]/10 text-[#94fbdd]' : 'bg-zinc-800 text-gray-400'
          }`}>
          {insight.type === 'good' ? (
            <FireIcon className="h-5 w-5" />
          ) : (
            <LightBulbIcon className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="text-white font-bold text-base mb-1">{insight.title}</h3>
          <p className="text-sm text-gray-400 leading-snug">
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}
