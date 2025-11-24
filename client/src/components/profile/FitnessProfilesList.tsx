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
    return <div className="text-center py-6 text-slate-500">Chargement des profils...</div>;
  }

  if (!profiles) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">Aucun profil fitness créé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        key={profiles.id}
        className="rounded-2xl bg-white p-5 shadow-sm flex items-center justify-between"
      >
        <div className="space-y-1">
          <p className="font-medium text-slate-900">
            Profil #{profiles.id} • {new Date(profiles.createdAt || '').toLocaleDateString('fr-FR')}
          </p>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Âge: {profiles.age} ans • Taille: {profiles.height} cm • Poids: {profiles.weight} kg</p>
            <p>
              Séances/semaine: {profiles.trainingFrequency} • Niveau:{' '}
              {profiles.experienceLevel === 'BEGINNER'
                ? 'Débutant'
                : profiles.experienceLevel === 'INTERMEDIATE'
                  ? 'Intermédiaire'
                  : 'Avancé'}
            </p>
            <p>
              Objectifs:{' '}
              {profiles.goals.length > 0
                ? profiles.goals
                  .map(g => (g === 'MUSCLE_GAIN' ? 'Gain musculaire' : 'Perte de poids'))
                  .join(', ')
                : 'Aucun'}
            </p>
            <p>Genre: {profiles.gender === 'MALE' ? 'Homme' : profiles.gender === 'FEMALE' ? 'Femme' : 'Autre'}</p>
            <p>Bodyweight: {profiles.bodyWeight ? 'Oui' : 'Non'}</p>
          </div>
        </div>
        <button
          onClick={() => onDeleteClick(profiles.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <Trash2 size={14} />
          Supprimer
        </button>
      </div>
    </div>
  );
}