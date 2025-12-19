import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { MuscleGroup, MuscleCategory } from '../../types/fitness-profile.type';

interface MusclePrioritiesSelectorProps {
    muscleGroups: MuscleGroup[];
    selectedPriorities: number[];
    onChange: (priorities: number[]) => void;
}

export default function MusclePrioritiesSelector({ muscleGroups, selectedPriorities, onChange }: MusclePrioritiesSelectorProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<MuscleCategory>>(new Set());

    const toggleCategory = (category: MuscleCategory) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const toggleMuscle = (muscleId: number) => {
        const newPriorities = selectedPriorities.includes(muscleId)
            ? selectedPriorities.filter(id => id !== muscleId)
            : [...selectedPriorities, muscleId];
        onChange(newPriorities);
    };

    // Grouper par catégorie
    const groupedMuscles = muscleGroups.reduce((acc, muscle) => {
        if (!acc[muscle.category]) {
            acc[muscle.category] = [];
        }
        acc[muscle.category].push(muscle);
        return acc;
    }, {} as Record<MuscleCategory, MuscleGroup[]>);

    const categoryConfig: Record<MuscleCategory, { label: string; emoji: string }> = {
        CHEST: { label: 'Pectoraux', emoji: '💪' },
        BACK: { label: 'Dos', emoji: '🦵' },
        SHOULDERS: { label: 'Épaules', emoji: '🤸' },
        ARMS: { label: 'Bras', emoji: '💪' },
        LEGS: { label: 'Jambes', emoji: '🦿' },
        CORE: { label: 'Abdos', emoji: '🧘' },
        OTHER: { label: 'Autre', emoji: '✨' },
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 ">
                Priorités musculaires <span className="text-gray-500 text-xs">(optionnel)</span>
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#94fbdd]/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                {Object.entries(groupedMuscles).map(([category, muscles]) => {
                    const config = categoryConfig[category as MuscleCategory];
                    const isExpanded = expandedCategories.has(category as MuscleCategory);
                    const selectedInCategory = muscles.filter(m => selectedPriorities.includes(m.id)).length;

                    return (
                        <div key={category} className="bg-[#121214] rounded-lg overflow-hidden border border-[#94fbdd]/10">
                            {/* Category Header */}
                            <button
                                type="button"
                                onClick={() => toggleCategory(category as MuscleCategory)}
                                className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#1a1a1d] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{config.emoji}</span>
                                    <div className="text-left">
                                        <h4 className="text-white font-medium text-xs">{config.label}</h4>
                                        {selectedInCategory > 0 && (
                                            <p className="text-[#94fbdd] text-xs">{selectedInCategory} sélectionné{selectedInCategory > 1 ? 's' : ''}</p>
                                        )}
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {/* Muscles List */}
                            {isExpanded && (
                                <div className="px-3 pb-2 space-y-1.5">
                                    {muscles.map((muscle) => {
                                        const isSelected = selectedPriorities.includes(muscle.id);

                                        return (
                                            <button
                                                key={muscle.id}
                                                type="button"
                                                onClick={() => toggleMuscle(muscle.id)}
                                                className={`w-full p-2 rounded-lg border transition-all text-left flex items-center justify-between text-xs ${isSelected
                                                    ? 'border-[#94fbdd] bg-[#94fbdd]/5 text-white'
                                                    : 'border-[#94fbdd]/10 bg-[#1a1a1d] hover:border-[#94fbdd]/30 text-gray-400'
                                                    }`}
                                            >
                                                <span>{muscle.name}</span>
                                                {isSelected && (
                                                    <div className="w-4 h-4 rounded-full bg-[#94fbdd] flex items-center justify-center">
                                                        <CheckIcon className="w-2.5 h-2.5 text-[#121214]" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
