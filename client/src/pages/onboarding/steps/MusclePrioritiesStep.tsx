import { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { motion } from 'framer-motion';
import { Target, ArrowRight, ArrowLeft } from 'lucide-react';
import type { MuscleCategory } from '../../../types/fitness-profile.type';

interface MusclePrioritiesStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function MusclePrioritiesStep({ onNext, onBack }: MusclePrioritiesStepProps) {
    const { data, updateData } = useOnboardingStore();
    const [priorities, setPriorities] = useState<MuscleCategory[]>(data.musclePriorities || []);

    useEffect(() => {
        if (data.musclePriorities) {
            setPriorities(data.musclePriorities);
        }
    }, [data.musclePriorities]);

    const togglePriority = (muscle: MuscleCategory) => {
        if (priorities.includes(muscle)) {
            setPriorities(priorities.filter(m => m !== muscle));
        } else {
            setPriorities([...priorities, muscle]);
        }
    };

    const handleNext = () => {
        updateData({ musclePriorities: priorities });
        onNext();
    };

    const handleSkip = () => {
        updateData({ musclePriorities: [] });
        onNext();
    };

    const muscles: { value: MuscleCategory; label: string; emoji: string }[] = [
        { value: 'CHEST', label: 'Pectoraux', emoji: '💪' },
        { value: 'BACK', label: 'Dos', emoji: '🦵' },
        { value: 'SHOULDERS', label: 'Épaules', emoji: '🤸' },
        { value: 'ARMS', label: 'Bras', emoji: '💪' },
        { value: 'LEGS', label: 'Jambes', emoji: '🦿' },
        { value: 'CORE', label: 'Abdos', emoji: '🧘' },
    ];

    return (
        <div className="min-h-screen bg-[#121214] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#94fbdd]/20 to-[#7de3c7]/20 mb-6">
                        <Target className="w-8 h-8 text-[#94fbdd]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">
                        Avez-vous des priorités musculaires ?
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Sélectionnez les groupes musculaires que vous souhaitez développer en priorité
                    </p>
                </div>

                {/* Muscle Groups */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {muscles.map((muscle) => {
                        const isSelected = priorities.includes(muscle.value);

                        return (
                            <button
                                key={muscle.value}
                                onClick={() => togglePriority(muscle.value)}
                                className={`p-6 rounded-2xl border-2 transition-all ${isSelected
                                        ? 'border-[#94fbdd] bg-[#94fbdd]/10'
                                        : 'border-gray-700 bg-[#1a1a1d] hover:border-gray-600'
                                    }`}
                            >
                                <div className="text-4xl mb-3">{muscle.emoji}</div>
                                <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                    {muscle.label}
                                </h3>
                            </button>
                        );
                    })}
                </div>

                {/* Selected Count */}
                {priorities.length > 0 && (
                    <div className="mb-6 text-center">
                        <p className="text-gray-400">
                            {priorities.length} groupe{priorities.length > 1 ? 's' : ''} sélectionné{priorities.length > 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Skip Button */}
                {priorities.length === 0 && (
                    <div className="mb-6 text-center">
                        <button
                            onClick={handleSkip}
                            className="text-gray-400 hover:text-white transition-colors underline"
                        >
                            Pas de priorité particulière
                        </button>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 py-4 rounded-xl bg-[#1a1a1d] border-2 border-gray-700 text-white font-medium hover:border-gray-600 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] text-[#121214] font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        Continuer
                        <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
