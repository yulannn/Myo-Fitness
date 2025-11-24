// src/components/CreateProfileModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CreateFitnessProfilePayload } from '../../types/fitness-profile.type';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: CreateFitnessProfilePayload) => void;
  isPending: boolean;
}

export default function CreateProfileModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: CreateProfileModalProps) {
  const [form, setForm] = useState<CreateFitnessProfilePayload>({
    age: 0,
    height: 0,
    weight: 0,
    trainingFrequency: 0,
    experienceLevel: 'BEGINNER',
    goals: [],
    gender: 'MALE',
    bodyWeight: false,
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
        bodyWeight: false,
      });
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#1f3340] p-6 shadow-2xl border border-[#7CD8EE]/20">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#7CD8EE]">
            Créer un profil fitness
          </h3>
          <button
            onClick={onClose}
            className="text-[#7CD8EE]/70 hover:text-[#7CD8EE]"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-white">

          {/*  Inputs grid */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="age"
              placeholder="Âge"
              value={form.age || ''}
              onChange={handleChange}
              className="rounded-xl bg-[#2F4858] border border-[#7CD8EE]/30 px-3 py-2 text-sm placeholder-gray-300 text-white focus:ring-2 focus:ring-[#7CD8EE] focus:border-[#7CD8EE]"
              required
              min="13"
            />
            <input
              type="number"
              name="height"
              placeholder="Taille (cm)"
              value={form.height || ''}
              onChange={handleChange}
              className="rounded-xl bg-[#2F4858] border border-[#7CD8EE]/30 px-3 py-2 text-sm placeholder-gray-300 text-white focus:ring-2 focus:ring-[#7CD8EE]"
              required
              min="100"
            />

            <input
              type="number"
              name="weight"
              placeholder="Poids (kg)"
              value={form.weight || ''}
              onChange={handleChange}
              className="rounded-xl bg-[#2F4858] border border-[#7CD8EE]/30 px-3 py-2 text-sm placeholder-gray-300 text-white focus:ring-2 focus:ring-[#7CD8EE]"
              required
              min="30"
            />
            <input
              type="number"
              name="trainingFrequency"
              placeholder="Séances / semaine"
              value={form.trainingFrequency || ''}
              onChange={handleChange}
              className="rounded-xl bg-[#2F4858] border border-[#7CD8EE]/30 px-3 py-2 text-sm text-white placeholder-gray-300 focus:ring-2 focus:ring-[#7CD8EE]"
              required
              min="0"
              max="7"
            />
          </div>

          {/* Experience level */}
          <select
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={handleChange}
            className="w-full rounded-xl bg-[#2F4858] border border-[#7CD8EE]/30 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#7CD8EE]"
            required
          >
            <option value="">Niveau d’expérience</option>
            <option value="BEGINNER">Débutant</option>
            <option value="INTERMEDIATE">Intermédiaire</option>
            <option value="ADVANCED">Avancé</option>
          </select>

          {/* Goals */}
          <div className="flex gap-6 text-sm text-white">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="MUSCLE_GAIN"
                checked={form.goals.includes('MUSCLE_GAIN')}
                onChange={handleChange}
                className="h-4 w-4 rounded border-[#7CD8EE]/40 bg-[#2F4858] text-[#7CD8EE] focus:ring-[#7CD8EE]"
              />
              Gain musculaire
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="WEIGHT_LOSS"
                checked={form.goals.includes('WEIGHT_LOSS')}
                onChange={handleChange}
                className="h-4 w-4 rounded border-[#7CD8EE]/40 bg-[#2F4858] text-[#7CD8EE] focus:ring-[#7CD8EE]"
              />
              Perte de poids
            </label>
          </div>

          {/* Gender */}
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full rounded-xl bg-[#2F4858] border border-[#7CD8EE]/30 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#7CD8EE]"
            required
          >
            <option value="">Genre</option>
            <option value="MALE">Homme</option>
            <option value="FEMALE">Femme</option>
            <option value="OTHER">Autre</option>
          </select>

          {/* Bodyweight */}
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              name="bodyWeight"
              checked={form.bodyWeight}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[#7CD8EE]/40 bg-[#2F4858] text-[#7CD8EE] focus:ring-[#7CD8EE]"
            />
            Bodyweight uniquement
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl bg-[#7CD8EE] px-4 py-2 text-sm font-semibold text-[#2F4858] shadow-md hover:bg-[#6acbe0] transition active:scale-95 disabled:opacity-50"
            >
              {isPending ? 'Création...' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#7CD8EE]/40 bg-[#2F4858] px-4 py-2 text-sm font-semibold text-[#7CD8EE] shadow-sm hover:bg-[#3a5a6e] transition active:scale-95"
            >
              Annuler
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
