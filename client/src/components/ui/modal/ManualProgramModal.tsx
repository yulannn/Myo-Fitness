import { useState, useEffect } from 'react';
import { Modal, ModalFooter, ModalHeader, ModalTitle } from '../modal';
import type { Exercice } from '../../../types/exercice.type';
import { PlusIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface ExerciseSelection {
    id: number;
    sets: number;
    reps: number;
    weight: number | null;
}

interface SessionData {
    name: string;
    exercises: ExerciseSelection[];
}

interface ManualProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableExercises: Exercice[];
    fitnessProfileId: number;
    onConfirm: (data: {
        createProgramDto: {
            name: string;
            description?: string;
            fitnessProfileId: number;
        };
        sessions: SessionData[];
    }) => void;
    isPending?: boolean;
}

export const ManualProgramModal = ({
    isOpen,
    onClose,
    availableExercises,
    fitnessProfileId,
    onConfirm,
    isPending = false,
}: ManualProgramModalProps) => {
    const [programName, setProgramName] = useState('');
    const [programDescription, setProgramDescription] = useState('');
    const [numberOfSessions, setNumberOfSessions] = useState(1);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [currentStep, setCurrentStep] = useState<'info' | 'sessions'>('info');

    // Initialize sessions on mount and when number changes
    useEffect(() => {
        const newSessions: SessionData[] = Array.from({ length: numberOfSessions }, (_, i) => ({
            name: sessions[i]?.name || `Séance ${i + 1}`,
            exercises: sessions[i]?.exercises || [],
        }));
        setSessions(newSessions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numberOfSessions]);

    const handleAddExerciseToSession = (sessionIndex: number) => {
        const newSessions = [...sessions];
        newSessions[sessionIndex].exercises.push({
            id: availableExercises[0]?.id || 0,
            sets: 3,
            reps: 10,
            weight: null,
        });
        setSessions(newSessions);
    };

    const handleRemoveExerciseFromSession = (sessionIndex: number, exerciseIndex: number) => {
        const newSessions = [...sessions];
        newSessions[sessionIndex].exercises.splice(exerciseIndex, 1);
        setSessions(newSessions);
    };

    const handleUpdateExercise = (
        sessionIndex: number,
        exerciseIndex: number,
        field: keyof ExerciseSelection,
        value: any
    ) => {
        const newSessions = [...sessions];
        newSessions[sessionIndex].exercises[exerciseIndex] = {
            ...newSessions[sessionIndex].exercises[exerciseIndex],
            [field]: value,
        };
        setSessions(newSessions);
    };

    const handleUpdateSessionName = (sessionIndex: number, name: string) => {
        const newSessions = [...sessions];
        newSessions[sessionIndex].name = name;
        setSessions(newSessions);
    };

    const handleSubmit = () => {
        // Validation
        if (!programName.trim()) {
            alert('Veuillez entrer un nom pour le programme');
            return;
        }

        // Check that each session has at least one exercise
        const hasEmptySession = sessions.some(s => s.exercises.length === 0);
        if (hasEmptySession) {
            alert('Chaque séance doit contenir au moins un exercice');
            return;
        }

        onConfirm({
            createProgramDto: {
                name: programName,
                description: programDescription || undefined,
                fitnessProfileId,
            },
            sessions,
        });

        // Note: We don't reset form here immediately if pending, 
        // but the parent usually closes the modal on success which unmounts or resets.
    };

    const handleClose = () => {
        setProgramName('');
        setProgramDescription('');
        setNumberOfSessions(1);
        setSessions([]);
        setCurrentStep('info');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalHeader>
                <ModalTitle>
                    {currentStep === 'info'
                        ? 'Créer un programme manuel'
                        : 'Configurer les séances'}
                </ModalTitle>
            </ModalHeader>

            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                {currentStep === 'info' ? (
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-1">
                            <label htmlFor="program-name" className="font-semibold text-[#2F4858] text-xs uppercase">
                                Nom du programme <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="program-name"
                                type="text"
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] outline-none"
                                placeholder="Ex: Programme Full Body"
                                value={programName}
                                onChange={(e) => setProgramName(e.target.value)}
                                disabled={isPending}
                            />
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label htmlFor="program-description" className="font-semibold text-[#2F4858] text-xs uppercase">
                                Description (optionnel)
                            </label>
                            <textarea
                                id="program-description"
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] outline-none min-h-[80px]"
                                placeholder="Description de votre programme..."
                                rows={3}
                                value={programDescription}
                                onChange={(e) => setProgramDescription(e.target.value)}
                                disabled={isPending}
                            />
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label htmlFor="num-sessions" className="font-semibold text-[#2F4858] text-xs uppercase">
                                Nombre de séances <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="num-sessions"
                                type="number"
                                min="1"
                                max="7"
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] outline-none"
                                value={numberOfSessions}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        setNumberOfSessions(1);
                                    } else {
                                        const num = parseInt(value, 10);
                                        if (!isNaN(num)) {
                                            setNumberOfSessions(Math.max(1, Math.min(7, num)));
                                        }
                                    }
                                }}
                                disabled={isPending}
                            />
                            <span className="text-xs text-gray-500 mt-1">Maximum 7 séances</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sessions.map((session, sessionIndex) => (
                            <div key={sessionIndex} className="border border-[#7CD8EE]/20 rounded-xl p-4 bg-white shadow-sm">
                                <div className="mb-3">
                                    <label className="block mb-1 font-semibold text-[#2F4858] text-xs uppercase">
                                        Nom de la séance {sessionIndex + 1}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-[#2F4858] focus:ring-2 focus:ring-[#7CD8EE] outline-none"
                                        placeholder={`Séance ${sessionIndex + 1}`}
                                        value={session.name}
                                        onChange={(e) => handleUpdateSessionName(sessionIndex, e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>

                                <div className="mb-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-semibold text-[#2F4858] text-xs uppercase">Exercices</label>
                                        <button
                                            onClick={() => handleAddExerciseToSession(sessionIndex)}
                                            disabled={availableExercises.length === 0 || isPending}
                                            className="text-xs font-semibold text-[#7CD8EE] hover:text-[#2F4858] flex items-center gap-1 transition-colors disabled:opacity-50"
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Ajouter un exercice
                                        </button>
                                    </div>

                                    {session.exercises.length === 0 ? (
                                        <div className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            Aucun exercice ajouté
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {session.exercises.map((exercise, exerciseIndex) => (
                                                <div
                                                    key={exerciseIndex}
                                                    className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <select
                                                            className="w-full rounded-lg bg-white border border-gray-200 px-2 py-1.5 text-sm text-[#2F4858] focus:ring-1 focus:ring-[#7CD8EE] outline-none"
                                                            value={exercise.id}
                                                            onChange={(e) =>
                                                                handleUpdateExercise(
                                                                    sessionIndex,
                                                                    exerciseIndex,
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
                                                            onClick={() =>
                                                                handleRemoveExerciseFromSession(sessionIndex, exerciseIndex)
                                                            }
                                                            disabled={isPending}
                                                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-[#2F4858]/60 uppercase mb-1">
                                                                Séries
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="w-full rounded-lg bg-white border border-gray-200 px-2 py-1 text-sm text-[#2F4858] focus:ring-1 focus:ring-[#7CD8EE] outline-none"
                                                                value={exercise.sets}
                                                                onChange={(e) =>
                                                                    handleUpdateExercise(
                                                                        sessionIndex,
                                                                        exerciseIndex,
                                                                        'sets',
                                                                        parseInt(e.target.value) || 1
                                                                    )
                                                                }
                                                                disabled={isPending}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-[#2F4858]/60 uppercase mb-1">
                                                                Répétitions
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="w-full rounded-lg bg-white border border-gray-200 px-2 py-1 text-sm text-[#2F4858] focus:ring-1 focus:ring-[#7CD8EE] outline-none"
                                                                value={exercise.reps}
                                                                onChange={(e) =>
                                                                    handleUpdateExercise(
                                                                        sessionIndex,
                                                                        exerciseIndex,
                                                                        'reps',
                                                                        parseInt(e.target.value) || 1
                                                                    )
                                                                }
                                                                disabled={isPending}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-[#2F4858]/60 uppercase mb-1">
                                                                Poids (kg)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.5"
                                                                className="w-full rounded-lg bg-white border border-gray-200 px-2 py-1 text-sm text-[#2F4858] focus:ring-1 focus:ring-[#7CD8EE] outline-none"
                                                                value={exercise.weight || ''}
                                                                placeholder="—"
                                                                onChange={(e) =>
                                                                    handleUpdateExercise(
                                                                        sessionIndex,
                                                                        exerciseIndex,
                                                                        'weight',
                                                                        e.target.value ? parseFloat(e.target.value) : null
                                                                    )
                                                                }
                                                                disabled={isPending}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ModalFooter>
                <div className="flex justify-end gap-3 w-full px-4 pb-2">
                    {currentStep === 'sessions' && (
                        <button
                            onClick={() => setCurrentStep('info')}
                            disabled={isPending}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Retour
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        disabled={isPending}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    {currentStep === 'info' ? (
                        <button
                            onClick={() => setCurrentStep('sessions')}
                            disabled={!programName.trim() || isPending}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#2F4858] text-white font-semibold hover:bg-[#1e2e38] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant
                            <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7CD8EE] to-[#2F4858] text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Création...' : 'Créer le programme'}
                        </button>
                    )}
                </div>
            </ModalFooter>
        </Modal>
    );
};
