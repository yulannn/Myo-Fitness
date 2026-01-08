import { useProgramsByUser } from '../../api/hooks/program/useGetProgramsByUser'
import useGetUserStats from '../../api/hooks/session/useGetUserStats'
import useGetPersonalRecords from '../../api/hooks/session/useGetPersonalRecords'
import useGetUserStreak from '../../api/hooks/session/useGetUserStreak'
import useWeightHistory from '../../api/hooks/fitness-profile/useWeightHistory'
import { useFitnessProfilesByUser } from '../../api/hooks/fitness-profile/useGetFitnessProfilesByUser'
import {
  ArrowRightIcon,
  SparklesIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import ProgressChart from '../../components/home/ProgressChart'
import StreakTracker from '../../components/home/StreakTracker'
import PersonalRecords from '../../components/home/PersonalRecords'
import AIInsights from '../../components/home/AIInsights'
import HomeHeader from '../../components/home/HomeHeader'
import WeekCalendarPreview from '../../components/home/WeekCalendarPreview'

export default function Home() {
  const { data: programs } = useProgramsByUser()

  // 🚀 Nouveaux hooks optimisés (calcul côté backend/DB)
  const { data: stats } = useGetUserStats()
  const { data: records } = useGetPersonalRecords(3)
  const { data: streakData } = useGetUserStreak()

  const { data: weightHistory } = useWeightHistory()
  const { data: fitnessProfile } = useFitnessProfilesByUser()

  // Calculer l'activeProgram côté client (léger)
  const activeProgram = useMemo(() => {
    return Array.isArray(programs)
      ? programs.find((p: any) => p.status === 'ACTIVE')
      : null
  }, [programs])

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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Minimal Header with XP */}
        <HomeHeader />

        {/* Week Calendar Preview */}
        <WeekCalendarPreview />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/programs"
            className="group p-6 bg-[#18181b] border border-white/5 rounded-2xl hover:border-white/10 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">Mon Programme</p>
                <p className="text-gray-400 text-sm mt-1">
                  {activeProgram ? activeProgram.name : 'Créer un programme'}
                </p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            to="/sessions"
            className="group p-6 bg-[#18181b] border border-white/5 rounded-2xl hover:border-white/10 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">Mes Séances</p>
                <p className="text-gray-400 text-sm mt-1">
                  {stats?.upcomingSessions || 0} à venir
                </p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Myo - Assistant IA */}
        <Link
          to="/ai-chatbot"
          className="group block bg-[#18181b] border border-white/5 rounded-2xl p-4 hover:border-[#94fbdd]/40 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#94fbdd] to-[#7de0c4] flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-5 h-5 text-[#121214]" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">Myo - Assistant IA</h3>
              <p className="text-gray-500 text-xs">Pose tes questions sur le fitness</p>
            </div>

            {/* Arrow */}
            <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-[#94fbdd] group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </Link>

        {/* Progress Dashboard Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">Tableau de Bord</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart - Spans 2 columns on large screens */}
            <div className="lg:col-span-2 space-y-6">
              <ProgressChart
                data={weightData}
                title="Évolution du poids"
                unit="kg"
                color="#94fbdd"
                targetWeight={fitnessProfile?.targetWeight}
              />
              <PersonalRecords records={records || []} />
            </div>

            {/* Side Column - Insights & Streak */}
            <div className="space-y-6">
              <StreakTracker streakData={streakData} />
              <AIInsights stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}