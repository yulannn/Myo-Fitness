import { useProgramsByUser } from '../../api/hooks/program/useGetProgramsByUser'
import useGetAllUserSessions from '../../api/hooks/session/useGetAllUserSessions'
import useWeightHistory from '../../api/hooks/fitness-profile/useWeightHistory'
import {
  ArrowRightIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import ProgressChart from '../../components/home/ProgressChart'
import StreakTracker from '../../components/home/StreakTracker'
import PersonalRecords from '../../components/home/PersonalRecords'
import AIInsights from '../../components/home/AIInsights'
import HomeHeader from '../../components/home/HomeHeader'

export default function Home() {
  const { data: programs } = useProgramsByUser()
  const { data: sessions } = useGetAllUserSessions()
  const { data: weightHistory } = useWeightHistory()

  // Calculer les stats
  const stats = useMemo(() => {
    const completedSessions = sessions?.filter((s: any) => s.completed).length || 0
    const activeProgram = Array.isArray(programs)
      ? programs.find((p: any) => p.status === 'ACTIVE')
      : null
    const upcomingSessions = sessions?.filter((s: any) => !s.completed && s.date).length || 0

    return {
      completedSessions,
      activeProgram,
      upcomingSessions,
      totalSessions: sessions?.length || 0
    }
  }, [programs, sessions])

  // Transform weight history data for the chart
  // Limiter aux 90 derniers jours pour éviter la surcharge visuelle
  const weightData = useMemo(() => {
    if (!weightHistory || weightHistory.length === 0) {
      return [];
    }

    // Calculer la date il y a 90 jours
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Filtrer et transformer les données
    const filteredData = weightHistory
      .filter(entry => new Date(entry.date) >= ninetyDaysAgo)
      .map(entry => ({
        date: entry.date,
        value: entry.weight
      }));

    // Si on a plus de 30 points, échantillonner pour éviter la surcharge
    if (filteredData.length > 30) {
      const step = Math.ceil(filteredData.length / 30);
      return filteredData.filter((_, index) => index % step === 0 || index === filteredData.length - 1);
    }

    return filteredData;
  }, [weightHistory]);

  return (
    <div className="min-h-screen bg-[#121214] pb-24">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">

        {/* Minimal Header with XP */}
        <HomeHeader />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/programs"
            className="group p-4 bg-[#94fbdd] rounded-2xl shadow-lg shadow-[#94fbdd]/20 hover:shadow-xl hover:shadow-[#94fbdd]/30 transition-all active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[#121214] font-bold text-base sm:text-lg">Mon Programme</p>
                <p className="text-[#121214]/70 text-xs sm:text-sm mt-1">
                  {stats.activeProgram ? stats.activeProgram.name : 'Créer un programme'}
                </p>
              </div>
              <ArrowRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#121214] group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/sessions"
            className="group p-4 bg-[#252527] border border-[#94fbdd]/20 rounded-2xl hover:border-[#94fbdd]/40 transition-all active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-bold text-base sm:text-lg">Mes Séances</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  {stats.upcomingSessions} à venir
                </p>
              </div>
              <ArrowRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#94fbdd] group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>


        {/* Motivation Card */}
        <div className="relative bg-gradient-to-br from-[#94fbdd]/10 to-[#252527] rounded-3xl p-6 sm:p-8 border border-[#94fbdd]/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#94fbdd]/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-4 bg-[#94fbdd]/10 rounded-2xl">
              <BoltIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#94fbdd]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Continue comme ça ! 💪
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                {stats.completedSessions > 0
                  ? `Tu as déjà complété ${stats.completedSessions} séance${stats.completedSessions > 1 ? 's' : ''}. Chaque entraînement te rapproche de tes objectifs !`
                  : "Commence ton premier entraînement et lance ta transformation !"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Progress Dashboard Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
              <ChartBarIcon className="h-6 w-6 text-[#94fbdd]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Tableau de Progression</h2>
              <p className="text-sm text-gray-400">Analyse détaillée de ta performance (90 derniers jours)</p>
            </div>
          </div>

          {/* Weight Progress Chart */}
          <ProgressChart
            data={weightData}
            title="Évolution du poids"
            unit="kg"
            color="#94fbdd"
          />


          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Streak Tracker */}
            <StreakTracker sessions={sessions || []} />

            {/* AI Insights */}
            <AIInsights sessions={sessions || []} programs={programs || []} />
          </div>

          {/* Personal Records */}
          <PersonalRecords sessions={sessions || []} />
        </div>

      </div>
    </div>
  )
}