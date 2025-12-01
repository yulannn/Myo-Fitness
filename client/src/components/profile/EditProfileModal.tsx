// src/components/EditProfileModal.tsx
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { UpdateFitnessProfilePayload, FitnessProfile } from '../../types/fitness-profile.type';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (form: UpdateFitnessProfilePayload) => void;
    isPending: boolean;
    profile: FitnessProfile | null;
}

export default function EditProfileModal({
    isOpen,
    onClose,
    onSubmit,
    isPending,
    profile,
}: EditProfileModalProps) {
    const [form, setForm] = useState<UpdateFitnessProfilePayload>({
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
        if (isOpen && profile) {
            setForm({
                age: profile.age,
                height: profile.height,
                weight: profile.weight,
                trainingFrequency: profile.trainingFrequency,
                experienceLevel: profile.experienceLevel,
                goals: profile.goals,
                gender: profile.gender,
                bodyWeight: profile.bodyWeight,
            });
        }
    }, [isOpen, profile]);

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
                    const currentGoals = prev.goals || [];
                    const goals = checked
                        ? [...currentGoals, name as 'MUSCLE_GAIN' | 'WEIGHT_LOSS']
                        : currentGoals.filter(g => g !== name);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#7CD8EE]/20 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#2F4858]">
                        Modifier le profil fitness
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/*  Inputs grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#2F4858]/70 uppercase">Âge</label>
                            <input
                                type="number"
                                name="age"
                                placeholder="Âge"
                                value={form.age || ''}
                                onChange={handleChange}
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] focus:border-[#7CD8EE] outline-none transition-all"
                                required
                                min="13"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#2F4858]/70 uppercase">Taille (cm)</label>
                            <input
                                type="number"
                                name="height"
                                placeholder="Taille"
                                value={form.height || ''}
                                onChange={handleChange}
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] focus:border-[#7CD8EE] outline-none transition-all"
                                required
                                min="100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#2F4858]/70 uppercase">Poids (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                placeholder="Poids"
                                value={form.weight || ''}
                                onChange={handleChange}
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] focus:border-[#7CD8EE] outline-none transition-all"
                                required
                                min="30"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#2F4858]/70 uppercase">Séances/semaine</label>
                            <input
                                type="number"
                                name="trainingFrequency"
                                placeholder="Fréquence"
                                value={form.trainingFrequency || ''}
                                onChange={handleChange}
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] focus:border-[#7CD8EE] outline-none transition-all"
                                required
                                min="0"
                                max="7"
                            />
                        </div>
                    </div>

                    {/* Experience level */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#2F4858]/70 uppercase">Niveau d'expérience</label>
                        <select
                            name="experienceLevel"
                            value={form.experienceLevel}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] focus:border-[#7CD8EE] outline-none transition-all"
                            required
                        >
                            <option value="">Sélectionner...</option>
                            <option value="BEGINNER">Débutant</option>
                            <option value="INTERMEDIATE">Intermédiaire</option>
                            <option value="ADVANCED">Avancé</option>
                        </select>
                    </div>

                    {/* Goals */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#2F4858]/70 uppercase">Objectifs</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                <input
                                    type="checkbox"
                                    name="MUSCLE_GAIN"
                                    checked={(form.goals || []).includes('MUSCLE_GAIN')}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-[#7CD8EE] focus:ring-[#7CD8EE]"
                                />
                                <span className="text-sm text-[#2F4858]">Gain musculaire</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                <input
                                    type="checkbox"
                                    name="WEIGHT_LOSS"
                                    checked={(form.goals || []).includes('WEIGHT_LOSS')}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-[#7CD8EE] focus:ring-[#7CD8EE]"
                                />
                                <span className="text-sm text-[#2F4858]">Perte de poids</span>
                            </label>
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#2F4858]/70 uppercase">Genre</label>
                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] focus:border-[#7CD8EE] outline-none transition-all"
                            required
                        >
                            <option value="">Sélectionner...</option>
                            <option value="MALE">Homme</option>
                            <option value="FEMALE">Femme</option>
                            <option value="OTHER">Autre</option>
                        </select>
                    </div>

                    {/* Bodyweight */}
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                        <input
                            type="checkbox"
                            name="bodyWeight"
                            checked={form.bodyWeight || false}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-[#7CD8EE] focus:ring-[#7CD8EE]"
                        />
                        <span className="text-sm text-[#2F4858]">Bodyweight uniquement</span>
                    </label>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 rounded-xl bg-gradient-to-r from-[#7CD8EE] to-[#2F4858] px-4 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Modification...' : 'Modifier le profil'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition active:scale-95"
                        >
                            Annuler
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
