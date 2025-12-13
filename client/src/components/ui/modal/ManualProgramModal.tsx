import { useState, useEffect } from 'react';
import { Modal, ModalFooter, ModalHeader, ModalTitle, ModalContent } from '../modal';
import type { Exercice } from '../../../types/exercice.type';
import { PlusIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

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
            startDate?: string;
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
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [numberOfSessions, setNumberOfSessions] = useState(1);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [currentStep, setCurrentStep] = useState<'basics' | 'settings' | 'sessions'>('basics');

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
                startDate: startDate || new Date().toISOString(),
            },
            sessions,
        });
    };

    const handleClose = () => {
        setProgramName('');
        setProgramDescription('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setNumberOfSessions(1);
        setSessions([]);
        setCurrentStep('basics');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalHeader>
                <div className="flex items-center gap-2 justify-center">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-[#94fbdd]" />
                    <ModalTitle>
                        {currentStep === 'basics' && 'Informations (1/3)'}
                        {currentStep === 'settings' && 'Paramètres (2/3)'}
                        {currentStep === 'sessions' && 'Séances (3/3)'}
                    </ModalTitle>
                </div>
            </ModalHeader>

            <ModalContent>
                <div className="space-y-5 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#94fbdd]/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[#94fbdd]/40">
                    {currentStep === 'basics' && (
                        <div className="space-y-5">
                            {/* Program Name */}
                            <div className="space-y-2">
                                <label htmlFor="program-name" className="text-sm font-medium text-gray-300">
                                    Nom du programme <span className="text-[#94fbdd]">*</span>
                                </label>
                                <input
                                    id="program-name"
                                    type="text"
                                    className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                                    placeholder="Ex: Programme Full Body"
                                    value={programName}
                                    onChange={(e) => setProgramName(e.target.value)}
                                    disabled={isPending}
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label htmlFor="program-description" className="text-sm font-medium text-gray-300">
                                    Description (optionnel)
                                </label>
                                <textarea
                                    id="program-description"
                                    className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all min-h-[100px] resize-none"
                                    placeholder="Décrivez les objectifs de votre programme..."
                                    value={programDescription}
                                    onChange={(e) => setProgramDescription(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 'settings' && (
                        <div className="space-y-5">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <label htmlFor="program-start-date" className="text-sm font-medium text-gray-300">
                                    Date de début
                                </label>
                                <input
                                    id="program-start-date"
                                    type="date"
                                    className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all [color-scheme:dark]"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>

                            {/* Number of Sessions */}
                            <div className="space-y-2">
                                <label htmlFor="num-sessions" className="text-sm font-medium text-gray-300">
                                    Nombre de séances <span className="text-[#94fbdd]">*</span>
                                </label>
                                <input
                                    id="num-sessions"
                                    type="number"
                                    min="1"
                                    max="7"
                                    className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
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
                                <p className="text-xs text-gray-500">Maximum 7 séances par semaine</p>
                            </div>
                        </div>
                    )}

                    {currentStep === 'sessions' && (
                        <div className="space-y-4">
                            {sessions.map((session, sessionIndex) => (
                                <div key={sessionIndex} className="bg-[#121214] rounded-2xl p-4 border border-[#94fbdd]/10 space-y-4">
                                    {/* Session Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            Nom de la séance {sessionIndex + 1}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl bg-[#252527] border border-[#94fbdd]/20 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                                            placeholder={`Séance ${sessionIndex + 1}`}
                                            value={session.name}
                                            onChange={(e) => handleUpdateSessionName(sessionIndex, e.target.value)}
                                            disabled={isPending}
                                        />
                                    </div>

                                    {/* Exercises Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-300">Exercices</label>
                                            <button
                                                onClick={() => handleAddExerciseToSession(sessionIndex)}
                                                disabled={availableExercises.length === 0 || isPending}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#94fbdd]/10 border border-[#94fbdd]/30 text-[#94fbdd] text-sm font-semibold hover:bg-[#94fbdd]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                                Ajouter
                                            </button>
                                        </div>

                                        {session.exercises.length === 0 ? (
                                            <div className="text-center py-8 bg-[#252527] rounded-xl border border-dashed border-[#94fbdd]/20">
                                                <p className="text-sm text-gray-500 italic">Aucun exercice ajouté</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {session.exercises.map((exercise, exerciseIndex) => {
                                                    const selectedExercise = availableExercises.find(ex => ex.id === exercise.id);
                                                    return (
                                                        <div
                                                            key={exerciseIndex}
                                                            className="bg-[#252527] rounded-xl p-3 border border-[#94fbdd]/10 space-y-3"
                                                        >
                                                            {/* Exercise Selector and Delete */}
                                                            <div className="flex items-center gap-2">
                                                                <select
                                                                    className="flex-1 rounded-lg bg-[#121214] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
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
                                                                        className="w-full rounded-lg bg-[#121214] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
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
                                                                <div className="space-y-1">
                                                                    <label className="block text-xs font-medium text-gray-400">
                                                                        Reps
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        className="w-full rounded-lg bg-[#121214] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
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
                                                                <div className="space-y-1">
                                                                    <label className="block text-xs font-medium text-gray-400">
                                                                        Poids (kg)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.5"
                                                                        className="w-full rounded-lg bg-[#121214] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
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
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ModalContent>

            <ModalFooter>
                <div className="flex flex-col gap-3">
                    {/* First row: Back and Cancel buttons */}
                    <div className="flex gap-3">
                        {currentStep !== 'basics' && (
                            <button
                                onClick={() => setCurrentStep(currentStep === 'sessions' ? 'settings' : 'basics')}
                                disabled={isPending}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                Retour
                            </button>
                        )}
                        <button
                            onClick={handleClose}
                            disabled={isPending}
                            className="flex-1 px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                        >
                            Annuler
                        </button>
                    </div>

                    {/* Second row: Action button (Next or Create) */}
                    {currentStep !== 'sessions' ? (
                        <button
                            onClick={() => setCurrentStep(currentStep === 'basics' ? 'settings' : 'sessions')}
                            disabled={(currentStep === 'basics' && !programName.trim()) || isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant
                            <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-[#121214]/30 border-t-[#121214] rounded-full animate-spin"></div>
                                    Création...
                                </span>
                            ) : (
                                'Créer le programme'
                            )}
                        </button>
                    )}
                </div>
            </ModalFooter>
        </Modal>
    );
};
