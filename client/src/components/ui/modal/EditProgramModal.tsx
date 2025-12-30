import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PencilSquareIcon, HeartIcon, ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
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
                                <HeartIconSolid className="h-5 w-5 text-[#94fbdd]" aria-hidden="true" />
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
                    className="w-full px-4 py-3 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all font-medium"
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
                    className="w-full px-4 py-3 rounded-lg bg-[#252527] border border-[#94fbdd]/20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all h-24 resize-none font-medium"
                    placeholder="Description du programme..."
                    disabled={isPending}
                />
            </div>

            {/* Section: Modifier le programme */}
            <div className="pt-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Extensions</p>

                {/* Cardio Button */}
                <button
                    type="button"
                    onClick={onOpenCardio}
                    className="w-full flex items-center gap-4 p-4 bg-[#121214] rounded-xl border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 hover:bg-[#94fbdd]/5 transition-all group"
                >
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-[#94fbdd]/10 border border-[#94fbdd]/20 group-hover:bg-[#94fbdd]/20 transition-colors">
                        <HeartIcon className="h-6 w-6 text-[#94fbdd]" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-semibold text-white">Module Cardio</p>
                        <p className="text-sm text-gray-400">Intégrer du cardio à vos séances</p>
                    </div>
                    <ChevronLeftIcon className="h-5 w-5 text-gray-500 rotate-180 group-hover:text-white transition-colors" />
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
        <div className="space-y-6">
            {/* Toggle Include Cardio - Premium Design */}
            <button
                type="button"
                onClick={() => setIncludeCardio(!includeCardio)}
                className={`w-full relative group overflow-hidden rounded-2xl border transition-all duration-300 ${includeCardio
                    ? 'bg-[#94fbdd]/10 border-[#94fbdd] shadow-[0_0_20px_rgba(148,251,221,0.1)]'
                    : 'bg-[#121214] border-white/10 hover:border-white/20'
                    }`}
            >
                <div className="p-5 flex items-center gap-4 relative z-10">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${includeCardio ? 'bg-[#94fbdd] text-[#121214]' : 'bg-white/5 text-gray-400'
                        }`}>
                        <HeartIconSolid className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className={`font-bold text-lg ${includeCardio ? 'text-white' : 'text-gray-300'}`}>
                            Activer le Cardio
                        </h3>
                        <p className="text-sm text-gray-400">Ajouter automatiquement une session cardio</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${includeCardio
                        ? 'border-[#94fbdd] bg-[#94fbdd]'
                        : 'border-gray-500 group-hover:border-gray-400'
                        }`}>
                        {includeCardio && <CheckIcon className="w-4 h-4 text-[#121214] stroke-[3]" />}
                    </div>
                </div>
            </button>

            {/* Configuration Area */}
            <div className={`space-y-6 transition-all duration-300 ${includeCardio ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4 pointer-events-none grayscale'}`}>

                {/* 1. Position Segmented Control - Simplified */}
                <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Placement</p>
                    <div className="bg-[#121214] p-1 rounded-xl border border-white/5 flex gap-1">
                        <button
                            type="button"
                            onClick={() => setCardioPosition('START')}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${cardioPosition === 'START'
                                ? 'bg-[#252527] text-white shadow-lg border border-white/10'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            Début
                        </button>
                        <button
                            type="button"
                            onClick={() => setCardioPosition('END')}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${cardioPosition === 'END'
                                ? 'bg-[#252527] text-white shadow-lg border border-white/10'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            Fin
                        </button>
                    </div>
                </div>

                {/* 2. Duration Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Durée</p>
                        <span className="text-[#94fbdd] font-mono font-bold">{cardioDuration} min</span>
                    </div>
                    <div className="bg-[#121214] rounded-xl p-5 border border-white/5">
                        <input
                            type="range"
                            min="1"
                            max="60"
                            step="1"
                            value={cardioDuration}
                            onChange={(e) => setCardioDuration(Number(e.target.value))}
                            className="w-full h-2 bg-[#252527] rounded-full appearance-none cursor-pointer accent-[#94fbdd]"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
                            <span>5m</span>
                            <span>15m</span>
                            <span>30m</span>
                            <span>45m</span>
                            <span>60m</span>
                        </div>
                    </div>
                </div>

                {/* 3. Exercise Selection List - Simple Column */}
                <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Exercice</p>

                    {isLoadingCardio ? (
                        <div className="flex items-center justify-center py-12 bg-[#121214] rounded-xl border border-white/5">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#94fbdd] border-t-transparent" />
                        </div>
                    ) : cardioExercises.length === 0 ? (
                        <div className="text-center py-12 bg-[#121214] rounded-xl border border-white/5 text-gray-500 text-sm">
                            Aucun exercice disponible
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                            {cardioExercises.map((exercise) => (
                                <button
                                    key={exercise.id}
                                    type="button"
                                    onClick={() => setSelectedCardioExercise(exercise)}
                                    className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedCardioExercise?.id === exercise.id
                                        ? 'bg-[#94fbdd]/10 border-[#94fbdd] shadow-[0_4px_12px_rgba(148,251,221,0.1)]'
                                        : 'bg-[#121214] border-white/5 hover:border-white/10 hover:bg-[#252527]'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${selectedCardioExercise?.id === exercise.id ? 'bg-[#94fbdd] text-[#121214]' : 'bg-white/5 text-gray-400'
                                        }`}>
                                        {selectedCardioExercise?.id === exercise.id ? <CheckIcon className="w-5 h-5 stroke-[2.5]" /> : <HeartIcon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-sm font-semibold flex-1 ${selectedCardioExercise?.id === exercise.id ? 'text-white' : 'text-gray-300'
                                        }`}>
                                        {exercise.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Warning Message if cardio enabled but no exercise selected */}
            {includeCardio && !selectedCardioExercise && !isLoadingCardio && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
                    <span>⚠️ Veuillez sélectionner un exercice cardio pour valider.</span>
                </div>
            )}
        </div>
    );
};
