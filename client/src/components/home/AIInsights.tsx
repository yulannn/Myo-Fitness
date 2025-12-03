import { useMemo } from 'react';
import {
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface AIInsightsProps {
  sessions: any[];
  programs: any[];
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  icon: any;
  title: string;
  message: string;
  color: string;
}

export default function AIInsights({ sessions, programs }: AIInsightsProps) {
  const insights = useMemo(() => {
    const result: Insight[] = [];

    if (!sessions || sessions.length === 0) {
      return [{
        type: 'info' as const,
        icon: SparklesIcon,
        title: 'Commence ton aventure',
        message: 'Lance ta première séance pour recevoir des insights personnalisés !',
        color: '#94fbdd'
      }];
    }

    const completedSessions = sessions.filter(s => s.completed);
    const last7Days = sessions.filter(s => {
      if (!s.performedAt) return false;
      const date = new Date(s.performedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length;

    // Calculate average session duration
    const avgDuration = completedSessions.reduce((sum, s) => {
      return sum + (s.duration || 0);
    }, 0) / (completedSessions.length || 1);

    // Calculate total volume (weight * reps)
    let totalVolume = 0;
    let exerciseCount = 0;

    completedSessions.forEach(session => {
      if (session.exercices) {
        session.exercices.forEach((ex: any) => {
          if (ex.performances) {
            ex.performances.forEach((perf: any) => {
              totalVolume += (perf.weight || 0) * (perf.reps_effectuees || 0);
              exerciseCount++;
            });
          }
        });
      }
    });

    // Insight 1: Activity Level
    if (last7Days >= 4) {
      result.push({
        type: 'success',
        icon: FireIcon,
        title: 'Excellent rythme !',
        message: `Tu as complété ${last7Days} séances cette semaine. Continue comme ça pour des résultats optimaux !`,
        color: '#10b981'
      });
    } else if (last7Days >= 2) {
      result.push({
        type: 'info',
        icon: ChartBarIcon,
        title: 'Bon départ',
        message: `${last7Days} séances cette semaine. Essaie d'en ajouter 1-2 de plus pour maximiser tes progrès.`,
        color: '#94fbdd'
      });
    } else if (completedSessions.length > 0) {
      result.push({
        type: 'warning',
        icon: ClockIcon,
        title: 'Plus de régularité',
        message: 'Augmente ta fréquence d\'entraînement pour de meilleurs résultats. Vise au moins 3 séances par semaine.',
        color: '#f59e0b'
      });
    }

    // Insight 2: Session Duration
    if (avgDuration > 60 && avgDuration < 90) {
      result.push({
        type: 'success',
        icon: ClockIcon,
        title: 'Durée idéale',
        message: `Tes séances durent en moyenne ${Math.round(avgDuration)} minutes. C'est parfait pour l'hypertrophie !`,
        color: '#10b981'
      });
    } else if (avgDuration < 45) {
      result.push({
        type: 'tip',
        icon: LightBulbIcon,
        title: 'Prolonge tes séances',
        message: 'Tes séances sont courtes. Considère ajouter 1-2 exercices pour optimiser ton temps au gym.',
        color: '#94fbdd'
      });
    } else if (avgDuration > 120) {
      result.push({
        type: 'warning',
        icon: ClockIcon,
        title: 'Attention au surentraînement',
        message: 'Tes séances sont longues. Assure-toi de maintenir l\'intensité tout au long de l\'entraînement.',
        color: '#f59e0b'
      });
    }

    // Insight 3: Volume Trend
    if (completedSessions.length >= 3) {
      const recentSessions = completedSessions.slice(-3);
      let recentVolume = 0;

      recentSessions.forEach(session => {
        if (session.exercices) {
          session.exercices.forEach((ex: any) => {
            if (ex.performances) {
              ex.performances.forEach((perf: any) => {
                recentVolume += (perf.weight || 0) * (perf.reps_effectuees || 0);
              });
            }
          });
        }
      });

      const avgRecentVolume = recentVolume / recentSessions.length;
      const avgTotalVolume = totalVolume / completedSessions.length;

      if (avgRecentVolume > avgTotalVolume * 1.1) {
        result.push({
          type: 'success',
          icon: ChartBarIcon,
          title: 'Progression impressionnante',
          message: 'Ton volume d\'entraînement augmente ! Continue cette surcharge progressive.',
          color: '#10b981'
        });
      }
    }

    // Insight 4: Consistency Tip
    if (completedSessions.length >= 5) {
      const dates = completedSessions
        .map(s => new Date(s.performedAt))
        .sort((a, b) => a.getTime() - b.getTime());

      const dayDistribution = new Map<number, number>();
      dates.forEach(date => {
        const day = date.getDay();
        dayDistribution.set(day, (dayDistribution.get(day) || 0) + 1);
      });

      const mostCommonDay = Array.from(dayDistribution.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (mostCommonDay && mostCommonDay[1] >= 3) {
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        result.push({
          type: 'info',
          icon: SparklesIcon,
          title: 'Routine détectée',
          message: `Tu t'entraînes souvent le ${dayNames[mostCommonDay[0]]}. Garde cette régularité !`,
          color: '#94fbdd'
        });
      }
    }

    // Default insight if none generated
    if (result.length === 0) {
      result.push({
        type: 'tip',
        icon: LightBulbIcon,
        title: 'Astuce du jour',
        message: 'La régularité est la clé ! Planifie tes séances à l\'avance pour maximiser ta progression.',
        color: '#94fbdd'
      });
    }

    return result.slice(0, 3); // Limit to 3 insights
  }, [sessions, programs]);

  return (
    <div className="bg-gradient-to-br from-[#252527] to-[#121214] rounded-2xl p-6 border border-[#94fbdd]/10 overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#94fbdd]/5 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#94fbdd]/20 to-[#94fbdd]/10 rounded-xl">
            <SparklesIcon className="h-6 w-6 text-[#94fbdd]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">IA Insights</h3>
            <p className="text-xs text-gray-400">Analyses personnalisées</p>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon;

            return (
              <div
                key={index}
                className="group bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards',
                  opacity: 0
                }}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 p-2 rounded-lg"
                    style={{
                      backgroundColor: `${insight.color}15`
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: insight.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-white text-sm">{insight.title}</h4>
                      <div
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap"
                        style={{
                          backgroundColor: `${insight.color}20`,
                          color: insight.color
                        }}
                      >
                        {insight.type === 'success' ? '✓' :
                          insight.type === 'warning' ? '⚠' :
                            insight.type === 'tip' ? '💡' : 'ℹ'}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 p-3 bg-[#94fbdd]/5 rounded-xl border border-[#94fbdd]/10">
          <p className="text-xs text-center text-gray-400">
            🤖 L'IA analyse tes données pour t'aider à progresser plus vite
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
