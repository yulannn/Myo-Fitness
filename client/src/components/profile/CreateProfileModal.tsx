import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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
      <div className="w-full max-w-lg rounded-2xl bg-[#252527] p-6 shadow-2xl border border-[#94fbdd]/20 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">
            Créer un profil fitness
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#121214] rounded-lg"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Inputs grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Âge</label>
              <input
                type="number"
                name="age"
                placeholder="25"
                value={form.age || ''}
                onChange={handleChange}
                className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                required
                min="13"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Taille (cm)</label>
              <input
                type="number"
                name="height"
                placeholder="175"
                value={form.height || ''}
                onChange={handleChange}
                className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                required
                min="100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Poids (kg)</label>
              <input
                type="number"
                name="weight"
                placeholder="70"
                value={form.weight || ''}
                onChange={handleChange}
                className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                required
                min="30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Séances/semaine</label>
              <input
                type="number"
                name="trainingFrequency"
                placeholder="3"
                value={form.trainingFrequency || ''}
                onChange={handleChange}
                className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                required
                min="0"
                max="7"
              />
            </div>
          </div>

          {/* Experience level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Niveau d'expérience</label>
            <select
              name="experienceLevel"
              value={form.experienceLevel}
              onChange={handleChange}
              className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
              required
            >
              <option value="">Sélectionner...</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
            </select>
          </div>

          {/* Goals */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Objectifs</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#121214] transition-all border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 flex-1">
                <input
                  type="checkbox"
                  name="MUSCLE_GAIN"
                  checked={form.goals.includes('MUSCLE_GAIN')}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-600 bg-[#121214] text-[#94fbdd] focus:ring-[#94fbdd]/30 focus:ring-offset-0"
                />
                <span className="text-sm text-white">💪 Gain musculaire</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#121214] transition-all border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 flex-1">
                <input
                  type="checkbox"
                  name="WEIGHT_LOSS"
                  checked={form.goals.includes('WEIGHT_LOSS')}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-600 bg-[#121214] text-[#94fbdd] focus:ring-[#94fbdd]/30 focus:ring-offset-0"
                />
                <span className="text-sm text-white">🔥 Perte de poids</span>
              </label>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Genre</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
              required
            >
              <option value="">Sélectionner...</option>
              <option value="MALE">Homme</option>
              <option value="FEMALE">Femme</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          {/* Bodyweight */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#121214] transition-all border border-[#94fbdd]/10 hover:border-[#94fbdd]/30">
            <input
              type="checkbox"
              name="bodyWeight"
              checked={form.bodyWeight}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-600 bg-[#121214] text-[#94fbdd] focus:ring-[#94fbdd]/30 focus:ring-offset-0"
            />
            <span className="text-sm text-white">Bodyweight uniquement</span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#94fbdd]/20 bg-transparent px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-[#121214] transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-[#121214] bg-[#94fbdd] shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 ${isPending ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                  Création...
                </span>
              ) : (
                'Créer le profil'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
