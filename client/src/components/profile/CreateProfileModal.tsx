// src/components/CreateProfileModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { FitnessProfilePayload } from '../../api/services/fitnessProfileService';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: FitnessProfilePayload) => void;
  isPending: boolean;
}

export default function CreateProfileModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: CreateProfileModalProps) {
  const [form, setForm] = useState<FitnessProfilePayload>({
    age: 0,
    height: 0,
    weight: 0,
    trainingFrequency: 0,
    experienceLevel: 'BEGINNER',
    goals: [],
    gender: 'MALE',
    bodyWeight: true,
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        age: 0,
        height: 0,
        weight: 0,
        trainingFrequency: 0,
        experienceLevel: 'BEGINNER',
        goals: [],
        gender: 'MALE',
        bodyWeight: true,
      });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox' && 'checked' in e.target) {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'bodyWeight') {
        setForm(prev => ({ ...prev, bodyWeight: checked }));
      } else {
        setForm(prev => {
          const goals = checked
            ? [...prev.goals, name as 'MUSCLE_GAIN' | 'WEIGHT_LOSS']
            : prev.goals.filter(g => g !== name);
          return { ...prev, goals };
        });
      }
    } else if (type === 'number') {
      setForm(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Créer un profil fitness</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="age"
              placeholder="Âge"
              value={form.age || ''}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="13"
            />
            <input
              type="number"
              name="height"
              placeholder="Taille (cm)"
              value={form.height || ''}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="100"
            />
            <input
              type="number"
              name="weight"
              placeholder="Poids (kg)"
              value={form.weight || ''}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="30"
            />
            <input
              type="number"
              name="trainingFrequency"
              placeholder="Séances / semaine"
              value={form.trainingFrequency || ''}
              onChange={handleChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              max="7"
            />
          </div>

          <select
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Niveau d’expérience</option>
            <option value="BEGINNER">Débutant</option>
            <option value="INTERMEDIATE">Intermédiaire</option>
            <option value="ADVANCED">Avancé</option>
          </select>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="MUSCLE_GAIN"
                checked={form.goals.includes('MUSCLE_GAIN')}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Gain musculaire</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="WEIGHT_LOSS"
                checked={form.goals.includes('WEIGHT_LOSS')}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Perte de poids</span>
            </label>
          </div>

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Genre</option>
            <option value="MALE">Homme</option>
            <option value="FEMALE">Femme</option>
            <option value="OTHER">Autre</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="bodyWeight"
              checked={form.bodyWeight}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Bodyweight uniquement</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isPending ? 'Création...' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}