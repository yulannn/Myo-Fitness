import { useState } from 'react';
import { Modal, ModalFooter, ModalHeader, ModalTitle, ModalContent } from '../modal';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import { PlusIcon, TrashIcon, ClipboardDocumentListIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { SelectExerciseModal } from './SelectExerciseModal';

interface ExerciseSelection {
    id: number;
    sets: number;
    reps: number;
    weight: number | null;
}

interface AddSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableExercises: ExerciceMinimal[];
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

    // Modal state
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

    const handleOpenAddExercise = () => {
        setEditingExerciseIndex(null);
        setShowExerciseModal(true);
    };

    const handleOpenEditExercise = (index: number) => {
        setEditingExerciseIndex(index);
        setShowExerciseModal(true);
    };

    const handleExerciseSelect = (exerciseId: number) => {
        if (editingExerciseIndex !== null) {
            // Editing existing exercise
            const newExercises = [...exercises];
            newExercises[editingExerciseIndex] = {
                ...newExercises[editingExerciseIndex],
                id: exerciseId
            };
            setExercises(newExercises);
        } else {
            // Adding new exercise
            setExercises([
                ...exercises,
                {
                    id: exerciseId,
                    sets: 3,
                    reps: 10,
                    weight: null,
                },
            ]);
        }
        // Modal closes automatically via SelectExerciseModal's onSelect internal logic? 
        // No, SelectExerciseModal calls onSelect but doesn't mandate closing prop usage there, 
        // but looking at SelectExerciseModal implementation, it calls onClose internally or we should handle it?
        // Let's check SelectExerciseModal usage... it calls onSelect then handleClose. 
        // Wait, onSelect prop in SelectExerciseModal is `(exerciseId: number) => void`.
        // The modal handles its own closing via `handleClose` which calls `onClose`.
        // So I should just update state here. The modal implementation calls `onSelect` then `handleClose` (which calls the `onClose` prop).
        // So I don't need to manually set showExerciseModal(false) HERE if `onClose` updates it?
        // Actually SelectExerciseModal calls `onSelect` then `handleClose`. `handleClose` calls `onClose`.
        // So yes, I need to pass `() => setShowExerciseModal(false)` to `onClose`.
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

    const getExerciseName = (id: number) => {
        return availableExercises.find(e => e.id === id)?.name || 'Exercice inconnu';
    };

    return (
        <>
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
                                    onClick={handleOpenAddExercise}
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
                                        return (
                                            <div
                                                key={index}
                                                className="bg-[#121214] rounded-xl p-3 border border-[#94fbdd]/10 space-y-3"
                                            >
                                                {/* Exercise Selector and Delete */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenEditExercise(index)}
                                                        disabled={isPending}
                                                        className="flex-1 flex items-center justify-between rounded-lg bg-[#252527] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm hover:border-[#94fbdd]/50 transition-all text-left"
                                                    >
                                                        <span className="truncate">{getExerciseName(exercise.id)}</span>
                                                        <ArrowsRightLeftIcon className="h-4 w-4 text-gray-400" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleRemoveExercise(index)}
                                                        disabled={isPending}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                                        title="Supprimer l'exercice"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>

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

            {/* Exercise Selection Modal */}
            <SelectExerciseModal
                isOpen={showExerciseModal}
                onClose={() => setShowExerciseModal(false)}
                availableExercises={availableExercises}
                onSelect={handleExerciseSelect}
            />
        </>
    );
};
