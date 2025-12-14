import { useState } from 'react';
import { Modal, ModalFooter, ModalHeader, ModalTitle, ModalContent } from '../modal';
import type { Exercice } from '../../../types/exercice.type';
import { PlusIcon, TrashIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface ExerciseSelection {
    id: number;
    sets: number;
    reps: number;
    weight: number | null;
}

interface AddSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableExercises: Exercice[];
    onConfirm: (data: {
        sessionData: {
            name?: string;
            exercises: ExerciseSelection[];
        };
    }) => void;
    isPending?: boolean;
}

export const AddSessionModal = ({
    isOpen,
    onClose,
    availableExercises,
    onConfirm,
    isPending = false,
}: AddSessionModalProps) => {
    const [sessionName, setSessionName] = useState('');
    const [exercises, setExercises] = useState<ExerciseSelection[]>([]);

    const handleAddExercise = () => {
        if (availableExercises.length === 0) return;
        setExercises([
            ...exercises,
            {
                id: availableExercises[0].id,
                sets: 3,
                reps: 10,
                weight: null,
            },
        ]);
    };

    const handleRemoveExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleUpdateExercise = (
        index: number,
        field: keyof ExerciseSelection,
        value: any
    ) => {
        const newExercises = [...exercises];
        newExercises[index] = {
            ...newExercises[index],
            [field]: value,
        };
        setExercises(newExercises);
    };

    const handleSubmit = () => {
        if (exercises.length === 0) {
            alert('Veuillez ajouter au moins un exercice à la séance');
            return;
        }

        onConfirm({
            sessionData: {
                name: sessionName || undefined,
                exercises,
            },
        });

        // Reset form
        setSessionName('');
        setExercises([]);
    };

    const handleClose = () => {
        setSessionName('');
        setExercises([]);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalHeader>
                <div className="flex items-center gap-2 justify-center">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-[#94fbdd]" />
                    <ModalTitle>Ajouter une séance</ModalTitle>
                </div>
            </ModalHeader>

            <ModalContent>
                <div className="space-y-5 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#94fbdd]/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[#94fbdd]/40">
                    {/* Session Name */}
                    <div className="space-y-2">
                        <label htmlFor="session-name" className="text-sm font-medium text-gray-300">
                            Nom de la séance (optionnel)
                        </label>
                        <input
                            id="session-name"
                            type="text"
                            className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                            placeholder="Ex: Push Day, Séance Jambes..."
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            disabled={isPending}
                            autoFocus
                        />
                    </div>

                    {/* Exercises Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">
                                Exercices <span className="text-[#94fbdd]">*</span>
                            </label>
                            <button
                                onClick={handleAddExercise}
                                disabled={availableExercises.length === 0 || isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#94fbdd]/10 border border-[#94fbdd]/30 text-[#94fbdd] text-sm font-semibold hover:bg-[#94fbdd]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Ajouter
                            </button>
                        </div>

                        {exercises.length === 0 ? (
                            <div className="text-center py-8 bg-[#121214] rounded-xl border border-dashed border-[#94fbdd]/20">
                                <p className="text-sm text-gray-500 italic">Aucun exercice ajouté</p>
                                <p className="text-xs text-gray-600 mt-1">Cliquez sur "Ajouter" pour commencer</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {exercises.map((exercise, index) => {
                                    const selectedExercise = availableExercises.find(ex => ex.id === exercise.id);
                                    return (
                                        <div
                                            key={index}
                                            className="bg-[#121214] rounded-xl p-3 border border-[#94fbdd]/10 space-y-3"
                                        >
                                            {/* Exercise Selector and Delete */}
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="flex-1 rounded-lg bg-[#252527] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                                                    value={exercise.id}
                                                    onChange={(e) =>
                                                        handleUpdateExercise(
                                                            index,
                                                            'id',
                                                            parseInt(e.target.value)
                                                        )
                                                    }
                                                    disabled={isPending}
                                                >
                                                    {availableExercises.map((ex) => (
                                                        <option key={ex.id} value={ex.id}>
                                                            {ex.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveExercise(index)}
                                                    disabled={isPending}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                                    title="Supprimer l'exercice"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Muscle Group Badge */}
                                            {selectedExercise?.groupes && selectedExercise.groupes.length > 0 && (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {selectedExercise.groupes.map((g) => (
                                                        <span key={g.groupe.id} className="text-xs px-2 py-1 rounded-lg bg-[#94fbdd]/10 text-[#94fbdd] font-medium">
                                                            {g.groupe.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Sets, Reps, Weight */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-medium text-gray-400">
                                                        Séries
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full rounded-lg bg-[#252527] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                                                        value={exercise.sets}
                                                        onChange={(e) =>
                                                            handleUpdateExercise(
                                                                index,
                                                                'sets',
                                                                parseInt(e.target.value) || 1
                                                            )
                                                        }
                                                        disabled={isPending}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-medium text-gray-400">
                                                        Reps
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full rounded-lg bg-[#252527] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                                                        value={exercise.reps}
                                                        onChange={(e) =>
                                                            handleUpdateExercise(
                                                                index,
                                                                'reps',
                                                                parseInt(e.target.value) || 1
                                                            )
                                                        }
                                                        disabled={isPending}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-medium text-gray-400">
                                                        Poids (kg)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.5"
                                                        className="w-full rounded-lg bg-[#252527] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                                                        value={exercise.weight || ''}
                                                        placeholder="—"
                                                        onChange={(e) =>
                                                            handleUpdateExercise(
                                                                index,
                                                                'weight',
                                                                e.target.value ? parseFloat(e.target.value) : null
                                                            )
                                                        }
                                                        disabled={isPending}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </ModalContent>

            <ModalFooter>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isPending}
                        className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || exercises.length === 0}
                        className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                                Ajout en cours...
                            </span>
                        ) : (
                            'Ajouter la séance'
                        )}
                    </button>
                </div>
            </ModalFooter>
        </Modal>
    );
};
