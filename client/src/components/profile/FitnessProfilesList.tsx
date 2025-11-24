// src/components/FitnessProfilesList.tsx
import { Trash2 } from 'lucide-react';
import type { FitnessProfile } from '../../types/fitness-profile.type';

interface FitnessProfilesListProps {
  profiles?: FitnessProfile;
  isLoading: boolean;
  onAddClick: () => void;
  onDeleteClick: (id: number) => void;
}

export default function FitnessProfilesList({
  profiles,
  isLoading,
  onAddClick,
  onDeleteClick,
}: FitnessProfilesListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-[#7CD8EE] animate-pulse font-medium text-lg">
        Chargement des profils...
      </div>
    );
  }

  if (!profiles) {
    return (
      <div className="rounded-2xl bg-[#2F4858] p-10 text-center shadow-lg border border-[#7CD8EE]/20">
        <p className="text-[#7CD8EE] text-base font-semibold mb-5">
          Aucun profil fitness créé pour le moment.
        </p>
        <button
          onClick={onAddClick}
          className="rounded-xl bg-[#7CD8EE] px-5 py-2 text-[#2F4858] font-semibold shadow-md hover:bg-[#5FC0D9] transition active:scale-95"
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
          bg-gradient-to-br from-[#2F4858] to-[#1f3340]
          p-4 shadow-xl border border-[#2F4858]/30
          flex items-start justify-between gap-6
          transition-transform hover:scale-[1.02] hover:shadow-3xl
        "
      >
        <div className="space-y-3 text-white">
          <p className="font-bold text-xl tracking-tight flex items-center gap-2">
            Profil #{profiles.id}
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#7CD8EE]/30 border border-[#7CD8EE]/50 text-[#2F4858]">
              {new Date(profiles.createdAt || '').toLocaleDateString('fr-FR')}
            </span>
          </p>

          <div className="text-sm space-y-2 leading-relaxed opacity-90">
            <p>
              <span className="font-semibold text-[#7CD8EE]">Données physiques :</span>{' '}
              {profiles.age} ans • {profiles.height} cm • {profiles.weight} kg
            </p>

            <p>
              <span className="font-semibold text-[#7CD8EE]">Séances / semaine :</span>{' '}
              {profiles.trainingFrequency}
            </p>

            <p>
              <span className="font-semibold text-[#7CD8EE]">Niveau :</span>{' '}
              {profiles.experienceLevel === 'BEGINNER'
                ? 'Débutant'
                : profiles.experienceLevel === 'INTERMEDIATE'
                  ? 'Intermédiaire'
                  : 'Avancé'}
            </p>

            <p>
              <span className="font-semibold text-[#7CD8EE]">Objectifs :</span>{' '}
              {profiles.goals.length > 0
                ? profiles.goals
                  .map(g => (g === 'MUSCLE_GAIN' ? 'Gain musculaire' : 'Perte de poids'))
                  .join(', ')
                : 'Aucun'}
            </p>

            <p>
              <span className="font-semibold text-[#7CD8EE]">Genre :</span>{' '}
              {profiles.gender === 'MALE'
                ? 'Homme'
                : profiles.gender === 'FEMALE'
                  ? 'Femme'
                  : 'Autre'}
            </p>

            <p>
              <span className="font-semibold text-[#7CD8EE]">Bodyweight :</span>{' '}
              {profiles.bodyWeight ? 'Oui' : 'Non'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDeleteClick(profiles.id)}
          className="
            inline-flex items-center gap-1 rounded-xl 
            px-4 py-2 text-sm font-semibold
            bg-[#642f00] text-white border border-[#8b4c00]
            shadow-md hover:bg-[#8b4c00] active:scale-95 transition
          "
        >
          <Trash2 size={16} />
          Supprimer
        </button>
      </div>
    </div>
  );
}
