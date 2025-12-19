import { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, ArrowLeft, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { MuscleGroup, MuscleCategory } from '../../../types/fitness-profile.type';
import { useMuscleGroups } from '../../../api/hooks/muscle-group/useGetMuscleGroups';

interface MusclePrioritiesStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function MusclePrioritiesStep({ onNext, onBack }: MusclePrioritiesStepProps) {
    const { data, updateData } = useOnboardingStore();
    const [priorities, setPriorities] = useState<number[]>(data.musclePriorities || []);
    const [expandedCategories, setExpandedCategories] = useState<Set<MuscleCategory>>(new Set());

    // Utilisation du hook personnalisé pour charger les MuscleGroup
    const { data: muscleGroups = [], isLoading, isError } = useMuscleGroups();

    useEffect(() => {
        if (muscleGroups.length > 0 && expandedCategories.size === 0) {
            // Expand toutes les catégories par défaut
            const categories = new Set(muscleGroups.map((g: MuscleGroup) => g.category));
            setExpandedCategories(categories);
        }
    }, [muscleGroups]);

    useEffect(() => {
        if (data.musclePriorities) {
            setPriorities(data.musclePriorities);
        }
    }, [data.musclePriorities]);

    const togglePriority = (muscleId: number) => {
        if (priorities.includes(muscleId)) {
            setPriorities(priorities.filter(id => id !== muscleId));
        } else {
            setPriorities([...priorities, muscleId]);
        }
    };

    const toggleCategory = (category: MuscleCategory) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const handleNext = () => {
        updateData({ musclePriorities: priorities });
        onNext();
    };

    const handleSkip = () => {
        updateData({ musclePriorities: [] });
        onNext();
    };

    // Grouper les muscles par catégorie
    const groupedMuscles = muscleGroups.reduce((acc, muscle) => {
        if (!acc[muscle.category]) {
            acc[muscle.category] = [];
        }
        acc[muscle.category].push(muscle);
        return acc;
    }, {} as Record<MuscleCategory, MuscleGroup[]>);

    // Configuration des catégories avec emojis et couleurs
    const categoryConfig: Record<MuscleCategory, { label: string; emoji: string; color: string }> = {
        CHEST: { label: 'Pectoraux', emoji: '💪', color: 'from-red-500/20 to-red-600/20' },
        BACK: { label: 'Dos', emoji: '🦵', color: 'from-blue-500/20 to-blue-600/20' },
        SHOULDERS: { label: 'Épaules', emoji: '🤸', color: 'from-purple-500/20 to-purple-600/20' },
        ARMS: { label: 'Bras', emoji: '💪', color: 'from-orange-500/20 to-orange-600/20' },
        LEGS: { label: 'Jambes', emoji: '🦿', color: 'from-green-500/20 to-green-600/20' },
        CORE: { label: 'Abdos', emoji: '🧘', color: 'from-yellow-500/20 to-yellow-600/20' },
        OTHER: { label: 'Autre', emoji: '✨', color: 'from-gray-500/20 to-gray-600/20' },
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#121214] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#94fbdd] animate-spin" />
                    <p className="text-gray-400 text-sm">Chargement des groupes musculaires...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Erreur lors du chargement des groupes musculaires</p>
                    <button
                        onClick={handleSkip}
                        className="px-6 py-3 rounded-xl bg-[#1a1a1d] border-2 border-gray-700 text-white hover:border-gray-600 transition-all"
                    >
                        Continuer sans sélection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#94fbdd]/20 to-[#7de3c7]/20 mb-4">
                        <Target className="w-7 h-7 md:w-8 md:h-8 text-[#94fbdd]" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Avez-vous des priorités musculaires ?
                    </h1>
                    <p className="text-gray-400 text-sm md:text-lg">
                        Sélectionnez les muscles que vous souhaitez développer en priorité
                    </p>
                </div>

                {/* Muscle Groups - Accordion Style */}
                <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto">
                    {Object.entries(groupedMuscles).map(([category, muscles]) => {
                        const config = categoryConfig[category as MuscleCategory];
                        const isExpanded = expandedCategories.has(category as MuscleCategory);
                        const selectedInCategory = muscles.filter(m => priorities.includes(m.id)).length;

                        return (
                            <div key={category} className="bg-[#1a1a1d] rounded-xl overflow-hidden border border-gray-800">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(category as MuscleCategory)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#222226] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{config.emoji}</span>
                                        <div className="text-left">
                                            <h3 className="text-white font-bold text-sm md:text-base">{config.label}</h3>
                                            {selectedInCategory > 0 && (
                                                <p className="text-[#94fbdd] text-xs">{selectedInCategory} sélectionné{selectedInCategory > 1 ? 's' : ''}</p>
                                            )}
                                        </div>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>

                                {/* Muscles List */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-3 space-y-2">
                                                {muscles.map((muscle) => {
                                                    const isSelected = priorities.includes(muscle.id);

                                                    return (
                                                        <button
                                                            key={muscle.id}
                                                            onClick={() => togglePriority(muscle.id)}
                                                            className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between ${isSelected
                                                                    ? 'border-[#94fbdd] bg-[#94fbdd]/10'
                                                                    : 'border-gray-700 bg-[#222226] hover:border-gray-600'
                                                                }`}
                                                        >
                                                            <span className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                                {muscle.name}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="w-5 h-5 rounded-full bg-[#94fbdd] flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-[#121214]" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Selected Count */}
                {priorities.length > 0 && (
                    <div className="mb-4 text-center">
                        <p className="text-gray-400 text-sm">
                            {priorities.length} muscle{priorities.length > 1 ? 's' : ''} sélectionné{priorities.length > 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Skip Button */}
                {priorities.length === 0 && (
                    <div className="mb-4 text-center">
                        <button
                            onClick={handleSkip}
                            className="text-gray-400 hover:text-white transition-colors underline text-sm"
                        >
                            Pas de priorité particulière
                        </button>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="flex-1 py-3 md:py-4 rounded-xl bg-[#1a1a1d] border-2 border-gray-700 text-white font-medium hover:border-gray-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 py-3 md:py-4 rounded-xl bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] text-[#121214] font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        Continuer
                        <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
