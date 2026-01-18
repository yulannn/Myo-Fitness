import { useState, useEffect, useRef } from 'react';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import { PlusIcon, TrashIcon, XMarkIcon, ClipboardDocumentListIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { SelectExerciseModal } from './SelectExerciseModal';

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
    availableExercises: ExerciceMinimal[];
    fitnessProfileId: number;
    onConfirm: (data: {
        createProgramDto: {
            name: string;
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
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [numberOfSessions, setNumberOfSessions] = useState(1);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0); // 0: basics, 1: settings, 2: sessions

    // Animation state
    const [isClosing, setIsClosing] = useState(false);

    // Swipe to dismiss
    const [dragStartY, setDragStartY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Modal state for exercise selection
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        sessionIndex: number | null;
        exerciseIndex: number | null;
    }>({
        isOpen: false,
        sessionIndex: null,
        exerciseIndex: null,
    });

    // Initialize sessions on mount and when number changes
    useEffect(() => {
        const newSessions: SessionData[] = Array.from({ length: numberOfSessions }, (_, i) => ({
            name: sessions[i]?.name || `Séance ${i + 1}`,
            exercises: sessions[i]?.exercises || [],
        }));
        setSessions(newSessions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numberOfSessions]);

    // Handle smooth closing animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setProgramName('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setNumberOfSessions(1);
            setSessions([]);
            setCurrentStep(0);
            onClose();
        }, 300);
    };

    const handleOpenAddExercise = (sessionIndex: number) => {
        setModalState({
            isOpen: true,
            sessionIndex,
            exerciseIndex: null,
        });
    };

    const handleOpenEditExercise = (sessionIndex: number, exerciseIndex: number) => {
        setModalState({
            isOpen: true,
            sessionIndex,
            exerciseIndex,
        });
    };

    const handleExerciseSelect = (exerciseId: number) => {
        const { sessionIndex, exerciseIndex } = modalState;
        if (sessionIndex === null) return;

        const newSessions = [...sessions];

        if (exerciseIndex !== null) {
            // Edit existing exercise
            newSessions[sessionIndex].exercises[exerciseIndex] = {
                ...newSessions[sessionIndex].exercises[exerciseIndex],
                id: exerciseId,
            };
        } else {
            // Add new exercise
            newSessions[sessionIndex].exercises.push({
                id: exerciseId,
                sets: 3,
                reps: 10,
                weight: null,
            });
        }

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
                fitnessProfileId,
                startDate: startDate || new Date().toISOString(),
            },
            sessions,
        });
    };

    const getExerciseName = (id: number) => {
        return availableExercises.find(e => e.id === id)?.name || 'Exercice inconnu';
    };

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
    }, [isDragging, dragStartY]);

    if (!isOpen) return null;

    const steps = ['Informations', 'Paramètres', 'Séances'];

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-end pt-[3vh]">
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                    onClick={handleClose}
                />

                {/* Modal Container - Full Screen */}
                <div
                    ref={modalRef}
                    className={`relative z-[100] w-full h-[97vh] bg-[#252527] rounded-t-3xl shadow-2xl border-t border-x border-[#94fbdd]/10 flex flex-col transition-all duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
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

                        {/* Title and Icon */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <ClipboardDocumentListIcon className="h-6 w-6 text-[#94fbdd]" />
                            <h2 className="text-2xl font-bold text-white text-center">
                                Créer un programme
                            </h2>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-4 p-2 text-gray-400 hover:text-white hover:bg-[#121214] rounded-xl transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>

                        {/* Step Indicator - Modern Dots */}
                        <div className="flex items-center justify-center gap-2">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${index <= currentStep
                                                    ? 'bg-[#94fbdd] text-[#121214]'
                                                    : 'bg-white/10 text-gray-500'
                                                }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <span className={`text-xs transition-colors ${index === currentStep ? 'text-[#94fbdd] font-semibold' : 'text-gray-500'
                                            }`}>
                                            {step}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-12 h-0.5 transition-colors ${index < currentStep ? 'bg-[#94fbdd]' : 'bg-white/10'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="max-w-2xl mx-auto space-y-6">
                            {/* Step 1: Basics */}
                            {currentStep === 0 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="space-y-2">
                                        <label htmlFor="program-name" className="text-sm font-semibold text-gray-300">
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
                                </div>
                            )}

                            {/* Step 2: Settings */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {/* Start Date */}
                                    <div className="space-y-2">
                                        <label htmlFor="program-start-date" className="text-sm font-semibold text-gray-300">
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

                                    {/* Number of Sessions - Button Selectors */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-300">
                                            Nombre de séances <span className="text-[#94fbdd]">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                                <button
                                                    key={num}
                                                    onClick={() => setNumberOfSessions(num)}
                                                    disabled={isPending}
                                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${numberOfSessions === num
                                                            ? 'bg-[#94fbdd] text-[#121214] shadow-lg shadow-[#94fbdd]/20'
                                                            : 'bg-[#121214] text-gray-400 hover:bg-white/5 hover:text-white border border-white/10'
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 text-center">
                                            {numberOfSessions} séance{numberOfSessions > 1 ? 's' : ''} par semaine
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Sessions */}
                            {currentStep === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {sessions.map((session, sessionIndex) => (
                                        <div key={sessionIndex} className="bg-[#121214] rounded-2xl p-5 border border-[#94fbdd]/10 space-y-4">
                                            {/* Session Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-300">
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
                                                    <label className="text-sm font-semibold text-gray-300">Exercices</label>
                                                    <button
                                                        onClick={() => handleOpenAddExercise(sessionIndex)}
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
                                                        {session.exercises.map((exercise, exerciseIndex) => (
                                                            <div
                                                                key={exerciseIndex}
                                                                className="bg-[#252527] rounded-xl p-3 border border-[#94fbdd]/10 space-y-3"
                                                            >
                                                                {/* Exercise Selector and Delete */}
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleOpenEditExercise(sessionIndex, exerciseIndex)}
                                                                        disabled={isPending}
                                                                        className="flex-1 flex items-center justify-between rounded-lg bg-[#121214] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm hover:border-[#94fbdd]/50 transition-all text-left"
                                                                    >
                                                                        <span className="truncate">{getExerciseName(exercise.id)}</span>
                                                                        <ArrowsRightLeftIcon className="h-4 w-4 text-gray-400" />
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handleRemoveExerciseFromSession(sessionIndex, exerciseIndex)}
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
                                                                        <label className="block text-xs font-medium text-gray-400">Séries</label>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            className="w-full rounded-lg bg-[#121214] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all text-center"
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
                                                                        <label className="block text-xs font-medium text-gray-400">Reps</label>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            className="w-full rounded-lg bg-[#121214] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all text-center"
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
                                                                        <label className="block text-xs font-medium text-gray-400">Poids (kg)</label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.5"
                                                                            className="w-full rounded-lg bg-[#121214] border border-[#94fbdd]/20 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all text-center"
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
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-white/5">
                        <div className="max-w-2xl mx-auto flex gap-3">
                            {currentStep > 0 && (
                                <button
                                    onClick={() => setCurrentStep((currentStep - 1) as 0 | 1 | 2)}
                                    disabled={isPending}
                                    className="px-6 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                                >
                                    Retour
                                </button>
                            )}
                            <button
                                onClick={handleClose}
                                disabled={isPending}
                                className="flex-1 px-6 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            {currentStep < 2 ? (
                                <button
                                    onClick={() => setCurrentStep((currentStep + 1) as 0 | 1 | 2)}
                                    disabled={(currentStep === 0 && !programName.trim()) || isPending}
                                    className="flex-1 px-6 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Suivant
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                    className="flex-1 px-6 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </div>
                </div>
            </div>

            {/* Exercise Selection Modal */}
            <SelectExerciseModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                availableExercises={availableExercises}
                onSelect={handleExerciseSelect}
            />
        </>
    );
};
