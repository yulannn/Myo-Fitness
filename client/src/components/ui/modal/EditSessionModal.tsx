import { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { Session } from '../../../types/session.type';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import SessionService from '../../../api/services/sessionService';
import { SelectExerciseModal } from './SelectExerciseModal';

interface EditSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session;
    availableExercises: ExerciceMinimal[];
}

interface ExerciseRow {
    id?: number;
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
    const [isSelectingExercise, setIsSelectingExercise] = useState(false);
    const [sessionName, setSessionName] = useState<string>('');
    const [hasSessionNameChanged, setHasSessionNameChanged] = useState(false);
    const queryClient = useQueryClient();

    // Animation state (only closing)
    const [isClosing, setIsClosing] = useState(false);

    // Swipe to dismiss
    const [dragStartY, setDragStartY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle smooth closing animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300); // Match the transition duration
    };

    // Initialize exercises and sessionName from session
    useEffect(() => {
        if (session.exercices) {
            const mappedExercises: ExerciseRow[] = session.exercices.map((ex: any) => {
                const exerciceId = ex.exerciceId || ex.exercice?.id;
                return {
                    id: ex.id,
                    exerciceId: exerciceId,
                    exerciceName: ex.exercice?.name || `Exercice #${exerciceId || 'unknown'}`,
                    sets: ex.sets || 0,
                    reps: ex.reps || 0,
                    weight: ex.weight || 0,
                    isNew: false,
                    isModified: false,
                    toDelete: false,
                };
            });
            setExercises(mappedExercises);
        }
        setSessionName(session.sessionName ?? '');
        setHasSessionNameChanged(false);
    }, [session, isOpen]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const promises = [];

            if (hasSessionNameChanged) {
                promises.push(SessionService.updateSessionName(session.id, sessionName));
            }

            for (const exercise of exercises.filter(ex => ex.toDelete && !ex.isNew)) {
                if (!exercise.exerciceId) continue;
                promises.push(SessionService.deleteExerciseFromSession(session.id, exercise.exerciceId));
            }

            for (const exercise of exercises.filter(ex => ex.isNew && !ex.toDelete)) {
                if (!exercise.exerciceId) continue;
                promises.push(
                    SessionService.addExerciseToSession(session.id, exercise.exerciceId, {
                        id: exercise.exerciceId,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        weight: exercise.weight,
                    })
                );
            }

            for (const exercise of exercises.filter(ex => ex.isModified && !ex.isNew && !ex.toDelete)) {
                if (!exercise.exerciceId) continue;
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
            queryClient.invalidateQueries({ queryKey: ['program'] });
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            handleClose();
        },
        onError: (error) => {
            console.error('Error saving exercises:', error);
            alert('Erreur lors de la sauvegarde des modifications');
        },
    });

    const handleSelectExercise = (exerciceIdNumber: number) => {
        const exercise = availableExercises.find(ex => ex.id === exerciceIdNumber);

        if (!exercise) return;

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
    };

    const handleRemoveExercise = (index: number) => {
        const exercise = exercises[index];

        if (exercise.isNew) {
            setExercises(exercises.filter((_, i) => i !== index));
        } else {
            const updatedExercises = [...exercises];
            updatedExercises[index] = { ...updatedExercises[index], toDelete: true };
            setExercises(updatedExercises);
        }
    };

    const handleUpdateExercise = (index: number, field: 'sets' | 'reps' | 'weight', value: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[index] = {
            ...updatedExercises[index],
            [field]: value,
            isModified: !updatedExercises[index].isNew,
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

    // Handle drag on header
    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartY(e.clientY);
    };

    const handleHeaderTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setDragStartY(e.touches[0].clientY);
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (clientY: number) => {
            const deltaY = clientY - dragStartY;
            if (deltaY > 0 && modalRef.current) {
                modalRef.current.style.transform = `translateY(${deltaY}px)`;
            }
        };

        const handleEnd = () => {
            if (!modalRef.current) return;

            const transform = modalRef.current.style.transform;
            const match = transform.match(/translateY\((\d+)px\)/);
            const deltaY = match ? parseInt(match[1]) : 0;

            if (deltaY > 100) {
                handleClose();
            } else {
                modalRef.current.style.transform = '';
            }
            setIsDragging(false);
        };

        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
        const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, dragStartY, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className={`relative z-[100] w-full h-[92vh] bg-[#252527] rounded-t-3xl shadow-2xl border-t border-x border-[#94fbdd]/10 flex flex-col transition-all duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
            >
                {/* Draggable Header */}
                <div
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing px-6 pt-6 pb-4"
                    onMouseDown={handleHeaderMouseDown}
                    onTouchStart={handleHeaderTouchStart}
                >
                    {/* Drag Handle */}
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white text-center">
                        Modifier la séance
                    </h2>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-4 p-2 text-gray-400 hover:text-white hover:bg-[#121214] rounded-xl transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    <div className="space-y-4">
                        {/* Notes Section */}
                        <div className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3">
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="h-5 w-5 text-[#94fbdd]" />
                                <h4 className="text-white font-semibold">Nom de la séance</h4>
                                {hasSessionNameChanged && (
                                    <span className="ml-auto text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-lg">
                                        Modifié
                                    </span>
                                )}
                            </div>
                            <input
                                value={sessionName}
                                onChange={(e) => {
                                    setSessionName(e.target.value);
                                    setHasSessionNameChanged(true);
                                }}
                                placeholder="Donnez un nom à cette séance... (ex: Séance Pectoraux, Push Day, etc.)"
                                className="w-full px-4 py-3 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 resize-none transition-all"
                            />
                        </div>

                        {/* Add Exercise Button */}
                        <button
                            onClick={() => setIsSelectingExercise(true)}
                            disabled={filteredExercises.length === 0}
                            className="w-full p-4 rounded-xl bg-[#121214] border border-[#94fbdd]/20 hover:border-[#94fbdd]/40 hover:bg-[#1a1a1c] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="h-5 w-5 text-[#94fbdd]" />
                            <span className="font-medium text-white">
                                {filteredExercises.length === 0 ? 'Tous les exercices sont déjà ajoutés' : 'Ajouter un exercice'}
                            </span>
                        </button>


                        {/* Exercises List */}
                        {visibleExercises.map((exercise) => {
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
                                                value={exercise.sets === 0 ? '' : exercise.sets}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleUpdateExercise(realIndex, 'sets', value === '' ? 0 : Number(value));
                                                }}
                                                className="w-full px-3 py-2 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">Reps</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={exercise.reps === 0 ? '' : exercise.reps}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleUpdateExercise(realIndex, 'reps', value === '' ? 0 : Number(value));
                                                }}
                                                className="w-full px-3 py-2 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">Poids (kg)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={exercise.weight === 0 || exercise.weight === undefined ? '' : exercise.weight}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleUpdateExercise(realIndex, 'weight', value === '' ? 0 : Number(value));
                                                }}
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

                    </div>
                    {/* Aesthetic Divider */}
                    <div className="flex items-center gap-3 py-4 pt-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#94fbdd]/20 to-transparent"></div>
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#94fbdd]/30"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#94fbdd]/50"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#94fbdd]/30"></div>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#94fbdd]/20 to-transparent"></div>
                    </div>
                </div>


                {/* SelectExerciseModal */}
                <SelectExerciseModal
                    isOpen={isSelectingExercise}
                    onClose={() => setIsSelectingExercise(false)}
                    onSelect={handleSelectExercise}
                    availableExercises={filteredExercises}
                />

                {/* Footer */}
                <div className="flex-shrink-0 px-6 pb-6 pt-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleClose}
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
                </div>
            </div>
        </div>
    );
};
