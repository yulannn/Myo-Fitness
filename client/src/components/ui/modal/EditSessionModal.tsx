import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalFooter, ModalContent } from './index';
import { PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import type { Session } from '../../../types/session.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionService from '../../../api/services/sessionService';

interface EditSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session;
    availableExercises: any[];
}

interface ExerciseRow {
    id?: number; // L'ID de l'exerciceSession (pas l'exercice lui-même)
    exerciceId: number;
    exerciceName: string;
    sets: number;
    reps: number;
    weight?: number;
    isNew?: boolean;
    isModified?: boolean;
    toDelete?: boolean;
}

export const EditSessionModal = ({ isOpen, onClose, session, availableExercises }: EditSessionModalProps) => {
    const [exercises, setExercises] = useState<ExerciseRow[]>([]);
    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
    const queryClient = useQueryClient();

    // Initialize exercises from session
    useEffect(() => {
        if (session.exercices) {
            const mappedExercises: ExerciseRow[] = session.exercices.map((ex: any) => ({
                id: ex.id,
                exerciceId: ex.exerciceId,
                exerciceName: ex.exercice?.name || `Exercice #${ex.exerciceId}`,
                sets: ex.sets || 0,
                reps: ex.reps || 0,
                weight: ex.weight || 0,
                isNew: false,
                isModified: false,
                toDelete: false,
            }));
            setExercises(mappedExercises);
        }
    }, [session, isOpen]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const promises = [];

            // Delete exercises marked for deletion
            for (const exercise of exercises.filter(ex => ex.toDelete && !ex.isNew)) {
                promises.push(
                    SessionService.deleteExerciseFromSession(session.id, exercise.exerciceId)
                );
            }

            // Add new exercises
            for (const exercise of exercises.filter(ex => ex.isNew && !ex.toDelete)) {
                promises.push(
                    SessionService.addExerciseToSession(session.id, exercise.exerciceId, {
                        id: exercise.exerciceId,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        weight: exercise.weight,
                    })
                );
            }

            // Update modified exercises
            for (const exercise of exercises.filter(ex => ex.isModified && !ex.isNew && !ex.toDelete)) {
                promises.push(
                    SessionService.updateExerciseInSession(session.id, exercise.exerciceId, {
                        id: exercise.exerciceId,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        weight: exercise.weight,
                    })
                );
            }

            await Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            onClose();
        },
        onError: (error) => {
            console.error('Error saving exercises:', error);
            alert('Erreur lors de la sauvegarde des modifications');
        },
    });

    const handleAddExerciseRow = () => {
        if (!selectedExerciseId) return;

        const exerciceIdNumber = Number(selectedExerciseId);
        const exercise = availableExercises.find(ex => ex.id === exerciceIdNumber);

        if (!exercise) return;

        // Check if exercise already exists and is not marked for deletion
        if (exercises.some(ex => ex.exerciceId === exerciceIdNumber && !ex.toDelete)) {
            alert('Cet exercice est déjà dans la séance');
            return;
        }

        const newExercise: ExerciseRow = {
            exerciceId: exerciceIdNumber,
            exerciceName: exercise.name,
            sets: 3,
            reps: 10,
            weight: 0,
            isNew: true,
            isModified: false,
            toDelete: false,
        };

        setExercises([...exercises, newExercise]);
        setSelectedExerciseId('');
        setIsAddingExercise(false);
    };

    const handleRemoveExercise = (index: number) => {
        const exercise = exercises[index];

        if (exercise.isNew) {
            // Just remove from local state
            setExercises(exercises.filter((_, i) => i !== index));
        } else {
            // Mark for deletion
            const updatedExercises = [...exercises];
            updatedExercises[index] = {
                ...updatedExercises[index],
                toDelete: true,
            };
            setExercises(updatedExercises);
        }
    };

    const handleUpdateExercise = (index: number, field: 'sets' | 'reps' | 'weight', value: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[index] = {
            ...updatedExercises[index],
            [field]: value,
            isModified: !updatedExercises[index].isNew, // Only mark as modified if it's not a new exercise
        };
        setExercises(updatedExercises);
    };

    const handleSaveAll = () => {
        saveMutation.mutate();
    };

    const filteredExercises = availableExercises.filter(
        ex => !exercises.some(sessionEx => sessionEx.exerciceId === ex.id && !sessionEx.toDelete)
    );

    const visibleExercises = exercises.filter(ex => !ex.toDelete);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader>
                <ModalTitle>
                    <div className="flex items-center gap-2 justify-center text-lg sm:text-2xl">
                        <PencilSquareIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#94fbdd]" />
                        <span>Modifier la séance</span>
                    </div>
                </ModalTitle>
            </ModalHeader>

            <ModalContent>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                    {/* Exercises List */}
                    {visibleExercises.map((exercise) => {
                        // Get the real index in the full exercises array
                        const realIndex = exercises.indexOf(exercise);

                        return (
                            <div
                                key={`${exercise.exerciceId}-${realIndex}`}
                                className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h4 className="text-white font-semibold flex-1 break-words">
                                        {exercise.exerciceName}
                                        {exercise.isNew && (
                                            <span className="ml-2 text-xs px-2 py-0.5 bg-[#94fbdd]/20 text-[#94fbdd] rounded-lg">
                                                Nouveau
                                            </span>
                                        )}
                                        {exercise.isModified && (
                                            <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-lg">
                                                Modifié
                                            </span>
                                        )}
                                    </h4>
                                    <button
                                        onClick={() => handleRemoveExercise(realIndex)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                        title="Supprimer l'exercice"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Séries</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={exercise.sets}
                                            onChange={(e) => handleUpdateExercise(realIndex, 'sets', Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Reps</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={exercise.reps}
                                            onChange={(e) => handleUpdateExercise(realIndex, 'reps', Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Poids (kg)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={exercise.weight || 0}
                                            onChange={(e) => handleUpdateExercise(realIndex, 'weight', Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {visibleExercises.length === 0 && (
                        <p className="text-center text-gray-500 py-8 italic">
                            Aucun exercice dans cette séance
                        </p>
                    )}

                    {/* Add Exercise Section */}
                    {isAddingExercise ? (
                        <div className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/30 space-y-3">
                            <h4 className="text-white font-semibold">Ajouter un exercice</h4>
                            <select
                                value={selectedExerciseId}
                                onChange={(e) => setSelectedExerciseId(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50"
                            >
                                <option value="">Choisir un exercice...</option>
                                {filteredExercises.map((ex) => (
                                    <option key={ex.id} value={ex.id}>
                                        {ex.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsAddingExercise(false);
                                        setSelectedExerciseId('');
                                    }}
                                    className="flex-1 px-4 py-2 rounded-lg border border-[#94fbdd]/20 text-gray-300 hover:bg-[#252527] transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAddExerciseRow}
                                    disabled={!selectedExerciseId}
                                    className="flex-1 px-4 py-2 rounded-lg bg-[#94fbdd] text-[#121214] font-bold hover:bg-[#94fbdd]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingExercise(true)}
                            disabled={filteredExercises.length === 0}
                            className="w-full p-4 rounded-xl border-2 border-dashed border-[#94fbdd]/30 text-[#94fbdd] hover:bg-[#94fbdd]/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span className="font-semibold">
                                {filteredExercises.length === 0 ? 'Tous les exercices sont déjà ajoutés' : 'Ajouter un exercice'}
                            </span>
                        </button>
                    )}
                </div>
            </ModalContent>

            <ModalFooter>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        disabled={saveMutation.isPending}
                        className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSaveAll}
                        disabled={saveMutation.isPending}
                        className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saveMutation.isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#121214] border-t-transparent" />
                                <span>Enregistrement...</span>
                            </div>
                        ) : (
                            'Enregistrer les modifications'
                        )}
                    </button>
                </div>
            </ModalFooter>
        </Modal>
    );
};
