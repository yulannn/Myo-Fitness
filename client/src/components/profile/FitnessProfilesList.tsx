import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#7CD8EE] border-t-transparent"></div>
      </div>
    );
  }

  if (!profiles) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-[#7CD8EE]/20">
        <div className="mx-auto w-16 h-16 bg-[#7CD8EE]/10 rounded-full flex items-center justify-center mb-4">
          <PlusIcon className="h-8 w-8 text-[#7CD8EE]" />
        </div>
        <h3 className="text-lg font-bold text-[#2F4858] mb-2">Aucun profil fitness</h3>
        <p className="text-[#2F4858]/60 text-sm mb-6">
          Créez votre profil pour suivre votre progression et obtenir des recommandations personnalisées.
        </p>
        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7CD8EE] to-[#2F4858] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <PlusIcon className="h-5 w-5" />
          Créer un profil
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        key={profiles.id}
        className="bg-white rounded-xl shadow-md p-6 border border-[#7CD8EE]/20 flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all hover:shadow-lg"
      >
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-[#7CD8EE] rounded-full"></div>
            <div>
              <h3 className="font-bold text-xl text-[#2F4858]">Mon Profil Physique</h3>
              <p className="text-sm text-[#2F4858]/60">Dernière mise à jour le {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-[#2F4858]/60 uppercase font-bold mb-1">Données physiques</p>
              <p className="text-[#2F4858] font-semibold">
                {profiles.age} ans • {profiles.height} cm • {profiles.weight} kg
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-[#2F4858]/60 uppercase font-bold mb-1">Fréquence</p>
              <p className="text-[#2F4858] font-semibold">
                {profiles.trainingFrequency} séances / semaine
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-[#2F4858]/60 uppercase font-bold mb-1">Niveau</p>
              <p className="text-[#2F4858] font-semibold">
                {profiles.experienceLevel === 'BEGINNER'
                  ? 'Débutant'
                  : profiles.experienceLevel === 'INTERMEDIATE'
                    ? 'Intermédiaire'
                    : 'Avancé'}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-[#2F4858]/60 uppercase font-bold mb-1">Genre</p>
              <p className="text-[#2F4858] font-semibold">
                {profiles.gender === 'MALE'
                  ? 'Homme'
                  : profiles.gender === 'FEMALE'
                    ? 'Femme'
                    : 'Autre'}
              </p>
            </div>
          </div>

          <div className="bg-[#7CD8EE]/10 p-4 rounded-xl border border-[#7CD8EE]/20">
            <p className="text-xs text-[#2F4858]/60 uppercase font-bold mb-2">Objectifs</p>
            <div className="flex flex-wrap gap-2">
              {profiles.goals.length > 0 ? (
                profiles.goals.map((g, index) => (
                  <span key={index} className="px-3 py-1 bg-white text-[#2F4858] text-sm font-medium rounded-full shadow-sm border border-[#7CD8EE]/20">
                    {g === 'MUSCLE_GAIN' ? 'Gain musculaire' : 'Perte de poids'}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#2F4858]/60 italic">Aucun objectif défini</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#2F4858]/70">
            <span className={`w-2 h-2 rounded-full ${profiles.bodyWeight ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            {profiles.bodyWeight ? 'Poids du corps inclus' : 'Poids du corps non inclus'}
          </div>
        </div>

        <button
          onClick={() => onEditClick(profiles)}
          className="
            flex items-center gap-2 rounded-xl 
            px-5 py-2.5 text-sm font-semibold
            bg-[#2F4858] text-white
            shadow-md hover:bg-[#7CD8EE] hover:shadow-lg active:scale-95 transition-all duration-200
            self-start
          "
        >
          <PencilSquareIcon className="h-4 w-4" />
          Modifier
        </button>
      </div>
    </div>
  );
}
