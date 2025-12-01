import { PencilSquareIcon, PlusIcon, FireIcon, ChartBarIcon, UserIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';
import type { FitnessProfile } from '../../types/fitness-profile.type';

interface FitnessProfilesListProps {
  profiles?: FitnessProfile;
  isLoading: boolean;
  onAddClick: () => void;
  onEditClick: (profile: FitnessProfile) => void;
}

export default function FitnessProfilesList({
  profiles,
  isLoading,
  onAddClick,
  onEditClick,
}: FitnessProfilesListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#94fbdd]/20 border-t-[#94fbdd]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-[#94fbdd]/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profiles) {
    return (
      <div className="relative bg-[#252527] rounded-3xl shadow-2xl p-12 text-center border border-[#94fbdd]/10 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[#94fbdd]/10 to-transparent rounded-full blur-3xl"></div>

        <div className="relative">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#94fbdd]/20 to-[#94fbdd]/5 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
            <TrophyIcon className="h-12 w-12 text-[#94fbdd]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Commence ton aventure fitness</h3>
          <p className="text-gray-400 text-base mb-8 max-w-md mx-auto">
            Créez votre profil pour débloquer des programmes personnalisés et suivre votre progression.
          </p>
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#94fbdd] text-[#121214] font-bold rounded-2xl shadow-lg shadow-[#94fbdd]/30 hover:bg-[#94fbdd]/90 hover:shadow-xl hover:shadow-[#94fbdd]/40 transition-all active:scale-95 text-lg"
          >
            <PlusIcon className="h-6 w-6" />
            Créer mon profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Profil Fitness</h2>
          <p className="text-gray-400">Vos informations d'entraînement</p>
        </div>
        <button
          onClick={() => onEditClick(profiles)}
          className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold bg-[#94fbdd] text-[#121214] shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 hover:shadow-xl hover:shadow-[#94fbdd]/30 active:scale-95 transition-all"
        >
          <PencilSquareIcon className="h-5 w-5" />
          Modifier
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="relative bg-[#252527] rounded-3xl shadow-2xl border border-[#94fbdd]/10 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#94fbdd]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#94fbdd]/5 to-transparent rounded-full blur-3xl"></div>

        <div className="relative p-8 space-y-8">
          {/* Stats Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Physical Stats */}
            <div className="bg-[#121214] p-6 rounded-2xl border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#94fbdd]/10 rounded-xl group-hover:bg-[#94fbdd]/20 transition-colors">
                  <ChartBarIcon className="h-6 w-6 text-[#94fbdd]" />
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Physique</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{profiles.age}</span>
                  <span className="text-gray-400 text-sm">ans</span>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="text-gray-400">{profiles.height} cm</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{profiles.weight} kg</span>
                </div>
              </div>
            </div>

            {/* Training Frequency */}
            <div className="bg-[#121214] p-6 rounded-2xl border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#94fbdd]/10 rounded-xl group-hover:bg-[#94fbdd]/20 transition-colors">
                  <ClockIcon className="h-6 w-6 text-[#94fbdd]" />
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Fréquence</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{profiles.trainingFrequency}</span>
                <span className="text-gray-400 text-sm">séances/sem</span>
              </div>
            </div>

            {/* Experience Level */}
            <div className="bg-[#121214] p-6 rounded-2xl border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#94fbdd]/10 rounded-xl group-hover:bg-[#94fbdd]/20 transition-colors">
                  <TrophyIcon className="h-6 w-6 text-[#94fbdd]" />
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Niveau</h3>
              </div>
              <div className="text-2xl font-bold text-white">
                {profiles.experienceLevel === 'BEGINNER'
                  ? 'Débutant'
                  : profiles.experienceLevel === 'INTERMEDIATE'
                    ? 'Intermédiaire'
                    : 'Avancé'}
              </div>
            </div>
          </div>

          {/* Goals & Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Goals */}
            <div className="bg-[#121214] p-6 rounded-2xl border border-[#94fbdd]/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
                  <FireIcon className="h-6 w-6 text-[#94fbdd]" />
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Objectifs</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profiles.goals.length > 0 ? (
                  profiles.goals.map((g, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[#94fbdd]/10 border border-[#94fbdd]/30 text-[#94fbdd] text-sm font-semibold rounded-xl hover:bg-[#94fbdd]/20 transition-all"
                    >
                      {g === 'MUSCLE_GAIN' ? '💪 Gain musculaire' : '🔥 Perte de poids'}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 italic">Aucun objectif défini</span>
                )}
              </div>
            </div>

            {/* Gender & Bodyweight */}
            <div className="bg-[#121214] p-6 rounded-2xl border border-[#94fbdd]/10 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
                    <UserIcon className="h-6 w-6 text-[#94fbdd]" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Genre</h3>
                </div>
                <div className="text-xl font-bold text-white">
                  {profiles.gender === 'MALE'
                    ? 'Homme'
                    : profiles.gender === 'FEMALE'
                      ? 'Femme'
                      : 'Autre'}
                </div>
              </div>

              <div className="pt-4 border-t border-[#94fbdd]/10">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${profiles.bodyWeight ? 'bg-[#94fbdd]' : 'bg-gray-600'} shadow-lg ${profiles.bodyWeight ? 'shadow-[#94fbdd]/50 animate-pulse' : ''}`}></span>
                  <span className="text-sm text-gray-400">
                    {profiles.bodyWeight ? 'Exercices au poids du corps' : 'Exercices avec équipement'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4 border-t border-[#94fbdd]/5">
            <ClockIcon className="h-4 w-4" />
            <span>Dernière mise à jour le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
