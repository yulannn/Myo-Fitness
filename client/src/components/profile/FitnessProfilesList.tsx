// src/components/FitnessProfilesList.tsx
import { Trash2 } from 'lucide-react';
import type { FitnessProfile } from '../../api/services/fitnessProfileService';

interface FitnessProfilesListProps {
  profiles: FitnessProfile[];
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

  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">Aucun profil fitness créé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map(profile => (
        <div
          key={profile.id}
          className="rounded-2xl bg-white p-5 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="font-medium text-slate-900">
              Profil #{profile.id} • {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
            </p>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Âge: {profile.age} ans • Taille: {profile.height} cm • Poids: {profile.weight} kg</p>
              <p>
                Séances/semaine: {profile.trainingFrequency} • Niveau:{' '}
                {profile.experienceLevel === 'BEGINNER'
                  ? 'Débutant'
                  : profile.experienceLevel === 'INTERMEDIATE'
                  ? 'Intermédiaire'
                  : 'Avancé'}
              </p>
              <p>
                Objectifs:{' '}
                {profile.goals.length > 0
                  ? profile.goals
                      .map(g => (g === 'MUSCLE_GAIN' ? 'Gain musculaire' : 'Perte de poids'))
                      .join(', ')
                  : 'Aucun'}
              </p>
              <p>Genre: {profile.gender === 'MALE' ? 'Homme' : profile.gender === 'FEMALE' ? 'Femme' : 'Autre'}</p>
              <p>Bodyweight: {profile.bodyWeight ? 'Oui' : 'Non'}</p>
            </div>
          </div>
          <button
            onClick={() => onDeleteClick(profile.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Trash2 size={14} />
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}