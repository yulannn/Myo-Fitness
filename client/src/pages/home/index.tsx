import { mockUser } from '../../data/mockData'
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#2F4858] to-[#7CD8EE] text-white p-6 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Myo Fitness</h1>
            <p className="text-white/80 text-sm">Bienvenue, {mockUser.name}</p>
          </div>
          <img
            src={mockUser.avatarUrl}
            alt={mockUser.name}
            className="h-10 w-10 rounded-full border-2 border-white/30"
          />
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6 mt-4">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-[#7CD8EE]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7CD8EE]/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="h-6 w-6 text-[#7CD8EE]" />
              <h2 className="text-xl font-bold text-[#2F4858]">Prêt à vous dépasser ?</h2>
            </div>
            <p className="text-[#2F4858]/70 mb-6 max-w-md">
              Votre prochain entraînement vous attend. Consultez votre programme ou rejoignez une séance de groupe.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/program"
                className="px-5 py-2.5 bg-[#2F4858] text-white rounded-xl font-semibold shadow-lg hover:bg-[#7CD8EE] hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
              >
                Mon Programme
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/sessions"
                className="px-5 py-2.5 bg-white text-[#2F4858] border border-[#2F4858]/20 rounded-xl font-semibold hover:bg-gray-50 transition-all active:scale-95"
              >
                Voir l'agenda
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats or Info could go here */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#7CD8EE] to-[#2F4858] rounded-2xl p-5 text-white shadow-lg">
            <p className="text-white/80 text-xs font-bold uppercase mb-1">Séances terminées</p>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#7CD8EE]/20 shadow-sm">
            <p className="text-[#2F4858]/60 text-xs font-bold uppercase mb-1">Cette semaine</p>
            <p className="text-3xl font-bold text-[#2F4858]">3</p>
          </div>
        </div>
      </div>
    </div>
  )
}