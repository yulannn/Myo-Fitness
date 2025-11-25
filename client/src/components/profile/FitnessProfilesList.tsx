import { Edit } from 'lucide-react';
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
      <div className="text-center py-8 text-[#46E1D3] font-medium text-lg">
        Chargement des profils...
      </div>
    );
  }

  if (!profiles) {
    return (
      <div className="rounded-2xl bg-black p-10 text-center shadow-lg border border-[#112F2B]/50">
        <p className="text-[#46E1D3] text-base font-semibold mb-5">
          Aucun profil fitness créé pour le moment.
        </p>
        <button
          onClick={onAddClick}
          className="rounded-xl bg-[#112F2B] px-5 py-2 text-[#46E1D3] font-semibold shadow-md hover:bg-[#134d41] transition active:scale-95"
        >
          Créer un profil
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        key={profiles.id}
        className="
          rounded-xl
          bg-black
          p-4 shadow-xl border border-[#112F2B]/50
          flex items-start justify-between gap-6
          transition-transform 
        "
      >
        <div className="space-y-3 text-[#FFFFFF] font-bold">
          <p className="font-bold text-xl tracking-tight flex items-center gap-2">
            FITNESS PROFILE
          </p>

          <div className="text-sm space-y-2 leading-relaxed opacity-90">
            <p>
              <span className="font-semibold text-[#46E1D3]">Données physiques :</span>{' '}
              {profiles.age} ans • {profiles.height} cm • {profiles.weight} kg
            </p>

            <p>
              <span className="font-semibold text-[#46E1D3]">Séances / semaine :</span>{' '}
              {profiles.trainingFrequency}
            </p>

            <p>
              <span className="font-semibold text-[#46E1D3]">Niveau :</span>{' '}
              {profiles.experienceLevel === 'BEGINNER'
                ? 'Débutant'
                : profiles.experienceLevel === 'INTERMEDIATE'
                  ? 'Intermédiaire'
                  : 'Avancé'}
            </p>

            <p>
              <span className="font-semibold text-[#46E1D3]">Objectifs :</span>{' '}
              {profiles.goals.length > 0
                ? profiles.goals
                  .map(g => (g === 'MUSCLE_GAIN' ? 'Gain musculaire' : 'Perte de poids'))
                  .join(', ')
                : 'Aucun'}
            </p>

            <p>
              <span className="font-semibold text-[#46E1D3]">Genre :</span>{' '}
              {profiles.gender === 'MALE'
                ? 'Homme'
                : profiles.gender === 'FEMALE'
                  ? 'Femme'
                  : 'Autre'}
            </p>

            <p>
              <span className="font-semibold text-[#46E1D3]">Bodyweight :</span>{' '}
              {profiles.bodyWeight ? 'Oui' : 'Non'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onEditClick(profiles)}
          className="
            inline-flex items-center gap-1 rounded-xl 
            px-4 py-2 text-sm font-semibold
            bg-[#112F2B] text-[#46E1D3] 
            shadow-md hover:bg-[#134d41] active:scale-95 transition
          "
        >
          <Edit size={16} />
          Modifier
        </button>
      </div>
    </div>
  );
}
