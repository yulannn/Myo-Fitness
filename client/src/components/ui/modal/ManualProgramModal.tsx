import { useState, useEffect } from 'react';
import { Modal, ModalFooter, ModalHeader, ModalTitle } from '../modal';
import Button from '../button/Button';
import type { Exercice } from '../../../types/exercice.type';

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
}

export const ManualProgramModal = ({
    isOpen,
    onClose,
    availableExercises,
    fitnessProfileId,
    onConfirm,
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

        // Reset form
        setProgramName('');
        setProgramDescription('');
        setNumberOfSessions(1);
        setSessions([]);
        setCurrentStep('info');
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
                        <div className="flex flex-col">
                            <label htmlFor="program-name" className="mb-1 font-medium text-sm">
                                Nom du programme <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="program-name"
                                type="text"
                                className="border rounded px-3 py-2"
                                placeholder="Ex: Programme Full Body"
                                value={programName}
                                onChange={(e) => setProgramName(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="program-description" className="mb-1 font-medium text-sm">
                                Description (optionnel)
                            </label>
                            <textarea
                                id="program-description"
                                className="border rounded px-3 py-2"
                                placeholder="Description de votre programme..."
                                rows={3}
                                value={programDescription}
                                onChange={(e) => setProgramDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="num-sessions" className="mb-1 font-medium text-sm">
                                Nombre de séances <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="num-sessions"
                                type="number"
                                min="1"
                                max="7"
                                className="border rounded px-3 py-2"
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
                            />
                            <span className="text-xs text-gray-500 mt-1">Maximum 7 séances</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sessions.map((session, sessionIndex) => (
                            <div key={sessionIndex} className="border rounded p-4 bg-gray-50">
                                <div className="mb-3">
                                    <label className="block mb-1 font-medium text-sm">
                                        Nom de la séance {sessionIndex + 1}
                                    </label>
                                    <input
                                        type="text"
                                        className="border rounded px-3 py-2 w-full"
                                        placeholder={`Séance ${sessionIndex + 1}`}
                                        value={session.name}
                                        onChange={(e) => handleUpdateSessionName(sessionIndex, e.target.value)}
                                    />
                                </div>

                                <div className="mb-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-medium text-sm">Exercices</label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAddExerciseToSession(sessionIndex)}
                                            disabled={availableExercises.length === 0}
                                        >
                                            + Ajouter un exercice
                                        </Button>
                                    </div>

                                    {session.exercises.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">Aucun exercice ajouté</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {session.exercises.map((exercise, exerciseIndex) => (
                                                <div
                                                    key={exerciseIndex}
                                                    className="bg-white border rounded p-3 space-y-2"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <select
                                                            className="border rounded px-2 py-1 text-sm flex-1 mr-2"
                                                            value={exercise.id}
                                                            onChange={(e) =>
                                                                handleUpdateExercise(
                                                                    sessionIndex,
                                                                    exerciseIndex,
                                                                    'id',
                                                                    parseInt(e.target.value)
                                                                )
                                                            }
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
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">
                                                                Séries
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="border rounded px-2 py-1 w-full text-sm"
                                                                value={exercise.sets}
                                                                onChange={(e) =>
                                                                    handleUpdateExercise(
                                                                        sessionIndex,
                                                                        exerciseIndex,
                                                                        'sets',
                                                                        parseInt(e.target.value) || 1
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">
                                                                Répétitions
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className="border rounded px-2 py-1 w-full text-sm"
                                                                value={exercise.reps}
                                                                onChange={(e) =>
                                                                    handleUpdateExercise(
                                                                        sessionIndex,
                                                                        exerciseIndex,
                                                                        'reps',
                                                                        parseInt(e.target.value) || 1
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">
                                                                Poids (kg)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.5"
                                                                className="border rounded px-2 py-1 w-full text-sm"
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
                <div className="flex justify-end gap-3">
                    {currentStep === 'sessions' && (
                        <Button variant="ghost" onClick={() => setCurrentStep('info')}>
                            Retour
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleClose}>
                        Annuler
                    </Button>
                    {currentStep === 'info' ? (
                        <Button
                            variant="primary"
                            onClick={() => setCurrentStep('sessions')}
                            disabled={!programName.trim()}
                        >
                            Suivant
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={handleSubmit}>
                            Créer le programme
                        </Button>
                    )}
                </div>
            </ModalFooter>
        </Modal>
    );
};
