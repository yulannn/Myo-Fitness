import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PencilSquareIcon, HeartIcon, ChevronLeftIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import useCardioExercises, { type CardioExercise } from '../../../api/hooks/exercice/useCardioExercises';
import useAddCardioToProgram from '../../../api/hooks/program/useAddCardioToProgram';
import useRemoveCardioFromProgram from '../../../api/hooks/program/useRemoveCardioFromProgram';

interface ExerciseInTemplate {
    id: number;
    duration?: number;
    orderInSession: number;
    exercise: {
        id: number;
        name: string;
        type?: string;
    };
}

interface SessionTemplateWithExercises {
    id: number;
    exercises: ExerciseInTemplate[];
}

interface ProgramWithTemplates {
    id: number;
    name: string;
    description?: string;
    sessionTemplates?: SessionTemplateWithExercises[];
}

interface EditProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { name: string; description: string }) => void;
    program: ProgramWithTemplates;
    isPending: boolean;
}

type CardioPosition = 'START' | 'END';
type ModalView = 'main' | 'cardio';

export const EditProgramModal: React.FC<EditProgramModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    program,
    isPending
}) => {
    const [name, setName] = useState(program.name);
    const [description, setDescription] = useState(program.description || '');
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Cardio state
    const [currentView, setCurrentView] = useState<ModalView>('main');
    const [includeCardio, setIncludeCardio] = useState(false);
    const [cardioPosition, setCardioPosition] = useState<CardioPosition>('START');
    const [cardioDuration, setCardioDuration] = useState(15);
    const [selectedCardioExercise, setSelectedCardioExercise] = useState<CardioExercise | null>(null);

    // Hooks
    const { data: cardioExercises = [], isLoading: isLoadingCardio } = useCardioExercises();
    const addCardioMutation = useAddCardioToProgram();
    const removeCardioMutation = useRemoveCardioFromProgram();

    // Handle smooth closing animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setCurrentView('main');
            onClose();
        }, 300);
    };

    // Update form when program changes or when cardioExercises are loaded
    useEffect(() => {
        if (isOpen) {
            setName(program.name);
            setDescription(program.description || '');
            setCurrentView('main');

            // Initialize cardio state from program data
            if (program.sessionTemplates && program.sessionTemplates.length > 0 && cardioExercises.length > 0) {
                const firstTemplate = program.sessionTemplates[0];
                const cardioExerciseInTemplate = firstTemplate.exercises?.find(
                    (ex) => ex.exercise?.type === 'CARDIO'
                );

                if (cardioExerciseInTemplate) {
                    setIncludeCardio(true);
                    setCardioDuration(cardioExerciseInTemplate.duration || 15);

                    // Determine position: if orderInSession is 0, it's at START, otherwise END
                    const isAtStart = cardioExerciseInTemplate.orderInSession === 0;
                    setCardioPosition(isAtStart ? 'START' : 'END');

                    // Find the matching exercise in cardioExercises list
                    const matchingExercise = cardioExercises.find(
                        (ex) => ex.id === cardioExerciseInTemplate.exercise.id
                    );
                    if (matchingExercise) {
                        setSelectedCardioExercise(matchingExercise);
                    }
                } else {
                    // No cardio found, reset to defaults
                    setIncludeCardio(false);
                    setCardioPosition('START');
                    setCardioDuration(15);
                    setSelectedCardioExercise(null);
                }
            } else if (program.sessionTemplates && program.sessionTemplates.length > 0) {
                // Templates exist but cardioExercises not loaded yet - check if any cardio exists
                const firstTemplate = program.sessionTemplates[0];
                const hasCardio = firstTemplate.exercises?.some(
                    (ex) => ex.exercise?.type === 'CARDIO'
                );
                if (!hasCardio) {
                    setIncludeCardio(false);
                    setCardioPosition('START');
                    setCardioDuration(15);
                    setSelectedCardioExercise(null);
                }
            }
        }
    }, [isOpen, program, cardioExercises]);

    // handleSubmit is not used directly but onConfirm is called in button onClick

    // Handle cardio validation
    const handleCardioValidate = async () => {
        if (!includeCardio) {
            // Remove cardio from all templates
            await removeCardioMutation.mutateAsync(program.id);
        } else if (selectedCardioExercise) {
            // Add cardio to all templates
            await addCardioMutation.mutateAsync({
                programId: program.id,
                dto: {
                    exerciseId: selectedCardioExercise.id,
                    position: cardioPosition,
                    duration: cardioDuration,
                },
            });
        }
        setCurrentView('main');
    };

    const isCardioLoading = addCardioMutation.isPending || removeCardioMutation.isPending;

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
                className={`relative z-[100] w-full min-h-[70vh] max-h-[92vh] bg-[#252527] rounded-t-3xl shadow-2xl border-t border-x border-[#94fbdd]/10 flex flex-col transition-all duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
            >
                {/* Header */}
                <div className="flex-shrink-0 px-6 pt-6 pb-4">
                    {/* Drag Handle */}
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                    </div>

                    {/* Title */}
                    <div className="flex items-center gap-3">
                        {currentView === 'cardio' && (
                            <button
                                onClick={() => setCurrentView('main')}
                                className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-[#121214] border border-[#94fbdd]/20 hover:bg-[#94fbdd]/10 transition-colors"
                            >
                                <ChevronLeftIcon className="h-5 w-5 text-[#94fbdd]" />
                            </button>
                        )}
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-[#94fbdd]/10 border border-[#94fbdd]/20">
                            {currentView === 'main' ? (
                                <PencilSquareIcon className="h-5 w-5 text-[#94fbdd]" aria-hidden="true" />
                            ) : (
                                <HeartIconSolid className="h-5 w-5 text-red-400" aria-hidden="true" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {currentView === 'main' ? 'Modifier le programme' : 'Configurer le cardio'}
                        </h2>
                    </div>

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
                    {currentView === 'main' ? (
                        <MainView
                            name={name}
                            setName={setName}
                            description={description}
                            setDescription={setDescription}
                            isPending={isPending}
                            onOpenCardio={() => setCurrentView('cardio')}
                        />
                    ) : (
                        <CardioView
                            cardioExercises={cardioExercises}
                            isLoadingCardio={isLoadingCardio}
                            includeCardio={includeCardio}
                            setIncludeCardio={setIncludeCardio}
                            cardioPosition={cardioPosition}
                            setCardioPosition={setCardioPosition}
                            cardioDuration={cardioDuration}
                            setCardioDuration={setCardioDuration}
                            selectedCardioExercise={selectedCardioExercise}
                            setSelectedCardioExercise={setSelectedCardioExercise}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 pb-6 pt-4">
                    {currentView === 'main' ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isPending}
                                className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={() => onConfirm({ name, description })}
                                disabled={isPending || !name.trim()}
                                className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#121214] border-t-transparent" />
                                        <span>Modification...</span>
                                    </div>
                                ) : (
                                    'Enregistrer les modifications'
                                )}
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleCardioValidate}
                            disabled={isCardioLoading || (includeCardio && !selectedCardioExercise)}
                            className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCardioLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#121214] border-t-transparent" />
                                    <span>Application...</span>
                                </div>
                            ) : (
                                'Appliquer les modifications'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main View Component
interface MainViewProps {
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (description: string) => void;
    isPending: boolean;
    onOpenCardio: () => void;
}

const MainView: React.FC<MainViewProps> = ({
    name,
    setName,
    description,
    setDescription,
    isPending,
    onOpenCardio,
}) => {
    return (
        <div className="space-y-4">
            {/* Name */}
            <div className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3">
                <label htmlFor="name" className="text-sm font-medium text-gray-300">
                    Nom du programme
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all"
                    placeholder="Nom du programme"
                    required
                    disabled={isPending}
                />
            </div>

            {/* Description */}
            <div className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3">
                <label htmlFor="description" className="text-sm font-medium text-gray-300">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all h-24 resize-none"
                    placeholder="Description du programme..."
                    disabled={isPending}
                />
            </div>

            {/* Section: Modifier le programme */}
            <div className="pt-2">
                <p className="text-sm font-medium text-gray-400 mb-3">Options du programme</p>

                {/* Cardio Button */}
                <button
                    type="button"
                    onClick={onOpenCardio}
                    className="w-full flex items-center gap-4 p-4 bg-[#121214] rounded-xl border border-[#94fbdd]/10 hover:border-red-400/30 hover:bg-red-400/5 transition-all group"
                >
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-red-400/10 border border-red-400/20 group-hover:bg-red-400/20 transition-colors">
                        <HeartIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-semibold text-white">Cardio</p>
                        <p className="text-sm text-gray-400">Ajouter du cardio à vos séances</p>
                    </div>
                    <ChevronLeftIcon className="h-5 w-5 text-gray-500 rotate-180" />
                </button>
            </div>
        </div>
    );
};

// Cardio View Component
interface CardioViewProps {
    cardioExercises: CardioExercise[];
    isLoadingCardio: boolean;
    includeCardio: boolean;
    setIncludeCardio: (value: boolean) => void;
    cardioPosition: CardioPosition;
    setCardioPosition: (value: CardioPosition) => void;
    cardioDuration: number;
    setCardioDuration: (value: number) => void;
    selectedCardioExercise: CardioExercise | null;
    setSelectedCardioExercise: (exercise: CardioExercise | null) => void;
}

const CardioView: React.FC<CardioViewProps> = ({
    cardioExercises,
    isLoadingCardio,
    includeCardio,
    setIncludeCardio,
    cardioPosition,
    setCardioPosition,
    cardioDuration,
    setCardioDuration,
    selectedCardioExercise,
    setSelectedCardioExercise,
}) => {
    return (
        <div className="space-y-4">
            {/* Toggle Include Cardio */}
            <div className="bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <HeartIconSolid className={`h-5 w-5 ${includeCardio ? 'text-red-400' : 'text-gray-500'}`} />
                        <div>
                            <p className="font-semibold text-white">Inclure le cardio</p>
                            <p className="text-sm text-gray-400">Ajouter du cardio à chaque séance</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIncludeCardio(!includeCardio)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${includeCardio ? 'bg-[#94fbdd]' : 'bg-gray-600'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${includeCardio ? 'left-7' : 'left-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Position Selector */}
            <div className={`bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3 transition-opacity ${!includeCardio ? 'opacity-50' : ''}`}>
                <p className="text-sm font-medium text-gray-300">Position dans la séance</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setCardioPosition('START')}
                        disabled={!includeCardio}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${cardioPosition === 'START'
                            ? 'bg-[#94fbdd] text-[#121214]'
                            : 'bg-[#252527] text-gray-400 hover:text-white'
                            } disabled:cursor-not-allowed`}
                    >
                        Début
                    </button>
                    <button
                        type="button"
                        onClick={() => setCardioPosition('END')}
                        disabled={!includeCardio}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${cardioPosition === 'END'
                            ? 'bg-[#94fbdd] text-[#121214]'
                            : 'bg-[#252527] text-gray-400 hover:text-white'
                            } disabled:cursor-not-allowed`}
                    >
                        Fin
                    </button>
                </div>
            </div>

            {/* Duration Selector */}
            <div className={`bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3 transition-opacity ${!includeCardio ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-[#94fbdd]" />
                    <p className="text-sm font-medium text-gray-300">Durée (minutes)</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="5"
                        max="60"
                        step="5"
                        value={cardioDuration}
                        onChange={(e) => setCardioDuration(Number(e.target.value))}
                        disabled={!includeCardio}
                        className="flex-1 h-2 bg-[#252527] rounded-full appearance-none cursor-pointer accent-[#94fbdd] disabled:cursor-not-allowed"
                    />
                    <div className="w-16 text-center py-2 px-3 bg-[#252527] rounded-lg text-white font-semibold">
                        {cardioDuration} min
                    </div>
                </div>
            </div>

            {/* Cardio Exercises List */}
            <div className={`bg-[#121214] rounded-xl p-4 border border-[#94fbdd]/10 space-y-3 transition-opacity ${!includeCardio ? 'opacity-50' : ''}`}>
                <p className="text-sm font-medium text-gray-300">Choisir un exercice</p>

                {isLoadingCardio ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#94fbdd] border-t-transparent" />
                    </div>
                ) : cardioExercises.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Aucun exercice cardio disponible
                    </div>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {cardioExercises.map((exercise) => (
                            <button
                                key={exercise.id}
                                type="button"
                                onClick={() => setSelectedCardioExercise(exercise)}
                                disabled={!includeCardio}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${selectedCardioExercise?.id === exercise.id
                                    ? 'bg-[#94fbdd]/20 border border-[#94fbdd]/50'
                                    : 'bg-[#252527] hover:bg-[#252527]/80 border border-transparent'
                                    } disabled:cursor-not-allowed`}
                            >
                                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${selectedCardioExercise?.id === exercise.id
                                    ? 'bg-[#94fbdd]'
                                    : 'bg-red-400/20'
                                    }`}>
                                    {selectedCardioExercise?.id === exercise.id ? (
                                        <CheckIcon className="h-5 w-5 text-[#121214]" />
                                    ) : (
                                        <HeartIcon className="h-5 w-5 text-red-400" />
                                    )}
                                </div>
                                <span className={`font-medium ${selectedCardioExercise?.id === exercise.id
                                    ? 'text-[#94fbdd]'
                                    : 'text-white'
                                    }`}>
                                    {exercise.name}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
