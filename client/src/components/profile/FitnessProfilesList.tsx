import { PencilSquareIcon, PlusIcon, FireIcon, ChartBarIcon, UserIcon, TrophyIcon } from '@heroicons/react/24/outline';
import type { FitnessProfile } from '../../types/fitness-profile.type';
import TrainingDaysDisplay from './TrainingDaysDisplay';
import MusclePrioritiesDisplay from './MusclePrioritiesDisplay';


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
    <div className="space-y-8">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Vos Statistiques</h2>
        <button
          onClick={() => onEditClick(profiles)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#94fbdd] bg-[#94fbdd]/5 border border-[#94fbdd]/20 rounded-lg hover:bg-[#94fbdd]/10 transition-colors"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Modifier
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Age */}
        <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Âge</p>
          <p className="text-2xl font-bold text-white">{profiles.age} <span className="text-sm text-gray-500 font-normal">ans</span></p>
        </div>

        {/* Weight */}
        <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Poids</p>
          <p className="text-2xl font-bold text-white">{profiles.weight} <span className="text-sm text-gray-500 font-normal">kg</span></p>
        </div>

        {/* Height */}
        <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Taille</p>
          <p className="text-2xl font-bold text-white">{profiles.height} <span className="text-sm text-gray-500 font-normal">cm</span></p>
        </div>

        {/* BMI Calculation (Optional/Derived) or Frequency */}
        <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Fréquence</p>
          <p className="text-2xl font-bold text-white">{profiles.trainingFrequency} <span className="text-sm text-gray-500 font-normal">/sem</span></p>
        </div>
      </div>

      {/* Secondary Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Level & Gender */}
        <div className="bg-[#18181b] p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#27272a] rounded-xl text-gray-400">
              <TrophyIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Niveau d'expérience</p>
              <p className="text-lg font-semibold text-white mt-1">
                {profiles.experienceLevel === 'BEGINNER' ? 'Débutant' :
                  profiles.experienceLevel === 'INTERMEDIATE' ? 'Intermédiaire' : 'Avancé'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 pt-4 border-t border-white/5">
            <div className="p-2 bg-[#27272a] rounded-xl text-gray-400">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Genre</p>
              <p className="text-lg font-semibold text-white mt-1">
                {profiles.gender === 'MALE' ? 'Homme' :
                  profiles.gender === 'FEMALE' ? 'Femme' : 'Autre'}
              </p>
            </div>
          </div>
        </div>

        {/* Goals & Type */}
        <div className="bg-[#18181b] p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#27272a] rounded-xl text-gray-400">
              <FireIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Objectif principal</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profiles.goals.map((g, index) => (
                  <span key={index} className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#94fbdd]/10 text-[#94fbdd] border border-[#94fbdd]/20">
                    {g === 'MUSCLE_GAIN' ? 'Prise de masse' : 'Perte de poids'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 pt-4 border-t border-white/5">
            <div className="p-2 bg-[#27272a] rounded-xl text-gray-400">
              <ChartBarIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Type d'entraînement</p>
              <p className="text-sm font-medium text-white mt-1">
                {profiles.bodyWeight ? 'Poids du corps (Calisthenics)' : 'Musculation avec équipement'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Days */}
      {profiles.trainingDays && profiles.trainingDays.length > 0 && (
        <div className="pt-2">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Jours d'entraînement</h3>
          <TrainingDaysDisplay selectedDays={profiles.trainingDays} />
        </div>
      )}

      {/* New Fields Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Target Weight */}
        {profiles.targetWeight && (
          <div className="bg-[#18181b] p-5 rounded-2xl border border-white/5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#27272a] rounded-xl text-gray-400">
                <ChartBarIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Objectif de poids</p>
                <p className="text-2xl font-bold text-white mt-1">{profiles.targetWeight} <span className="text-sm text-gray-500 font-normal">kg</span></p>
                {profiles.weight && (
                  <p className={`text-xs mt-2 font-medium ${profiles.targetWeight > profiles.weight ? 'text-green-400' : 'text-orange-400'}`}>
                    {profiles.targetWeight > profiles.weight
                      ? `+${(profiles.targetWeight - profiles.weight).toFixed(1)} kg à gagner`
                      : `${Math.abs(profiles.targetWeight - profiles.weight).toFixed(1)} kg à perdre`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Training Environment */}
        <div className="bg-[#18181b] p-5 rounded-2xl border border-white/5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#27272a] rounded-xl text-gray-400">
              {profiles.trainingEnvironment === 'HOME' ? <FireIcon className="h-5 w-5" /> : <TrophyIcon className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Environnement</p>
              <p className="text-lg font-semibold text-white mt-1">
                {profiles.trainingEnvironment === 'HOME' ? 'Maison' : 'Salle de sport'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Muscle Priorities */}
      <MusclePrioritiesDisplay priorities={profiles.musclePriorities || []} />
    </div>
  );
}
