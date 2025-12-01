import { useAuth } from '../../context/AuthContext'
import { useProgramsByUser } from '../../api/hooks/program/useGetProgramsByUser'
import useGetAllUserSessions from '../../api/hooks/session/useGetAllUserSessions'
import {
  SparklesIcon,
  ArrowRightIcon,
  FireIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'

export default function Home() {
  const { user } = useAuth()
  const { data: programs } = useProgramsByUser()
  const { data: sessions } = useGetAllUserSessions()

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div className="min-h-screen bg-[#121214] pb-24">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">

        {/* Welcome Section */}
        <div className="relative bg-gradient-to-br from-[#252527] to-[#121214] rounded-3xl shadow-2xl overflow-hidden border border-[#94fbdd]/10 p-6 sm:p-8">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#94fbdd]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#94fbdd]/5 to-transparent rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#94fbdd]/10 rounded-2xl">
                <SparklesIcon className="h-7 w-7 sm:h-8 sm:w-8 text-[#94fbdd]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'Champion'} !
                </h1>
                <p className="text-sm sm:text-base text-gray-400 mt-1">
                  Prêt à repousser tes limites aujourd'hui ?
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
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
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Séances terminées */}
          <div className="bg-[#252527] rounded-2xl p-4 sm:p-5 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
                <TrophyIcon className="h-5 w-5 text-[#94fbdd]" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.completedSessions}</p>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">Séances terminées</p>
          </div>

          {/* Total séances */}
          <div className="bg-[#252527] rounded-2xl p-4 sm:p-5 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
                <CalendarDaysIcon className="h-5 w-5 text-[#94fbdd]" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.totalSessions}</p>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">Total séances</p>
          </div>

          {/* À venir */}
          <div className="bg-[#252527] rounded-2xl p-4 sm:p-5 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
                <FireIcon className="h-5 w-5 text-[#94fbdd]" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.upcomingSessions}</p>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">À venir</p>
          </div>

          {/* Programmes */}
          <div className="bg-[#252527] rounded-2xl p-4 sm:p-5 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
                <ClipboardDocumentListIcon className="h-5 w-5 text-[#94fbdd]" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {Array.isArray(programs) ? programs.length : 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">Programmes</p>
          </div>
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

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link
            to="/profiles"
            className="group bg-[#252527] rounded-2xl p-5 sm:p-6 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all active:scale-95"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-[#94fbdd]/10 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-[#94fbdd]" />
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-600 group-hover:text-[#94fbdd] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">Mon Profil</h3>
            <p className="text-xs sm:text-sm text-gray-400">Gérer mes informations et objectifs</p>
          </Link>

          <Link
            to="/social"
            className="group bg-[#252527] rounded-2xl p-5 sm:p-6 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all active:scale-95"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-[#94fbdd]/10 rounded-xl">
                <FireIcon className="h-6 w-6 text-[#94fbdd]" />
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-600 group-hover:text-[#94fbdd] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">Social</h3>
            <p className="text-xs sm:text-sm text-gray-400">Rejoindre la communauté</p>
          </Link>
        </div>

      </div>
    </div>
  )
}