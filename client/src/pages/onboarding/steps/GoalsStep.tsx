import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { TrophyIcon, HeartIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import type { Goal } from '../../../types/fitness-profile.type';

interface GoalsStepProps {
    onNext: () => void;
    onBack: () => void;
}

const GOAL_OPTIONS: Array<{ value: Goal; label: string; icon: ReactNode; desc: string }> = [
    {
        value: 'MUSCLE_GAIN',
        label: 'Prendre du muscle',
        icon: <BoltIcon className="h-6 w-6" />,
        desc: 'Développer ta masse musculaire',
    },
    {
        value: 'WEIGHT_LOSS',
        label: 'Perdre du poids',
        icon: <ChartBarIcon className="h-6 w-6" />,
        desc: 'Affiner ta silhouette',
    },
    {
        value: 'ENDURANCE',
        label: 'Endurance',
        icon: <HeartIcon className="h-6 w-6" />,
        desc: 'Améliorer ton cardio',
    },
    {
        value: 'STRENGTH',
        label: 'Force',
        icon: <BoltIcon className="h-6 w-6" />,
        desc: 'Développer ta puissance',
    },
];

export default function GoalsStep({ onNext, onBack }: GoalsStepProps) {
    const { data, updateData } = useOnboardingStore();
    const [selectedGoals, setSelectedGoals] = useState<Goal[]>(data.goals || []);
    const [error, setError] = useState('');

    const toggleGoal = (goal: Goal) => {
        setError('');
        if (selectedGoals.includes(goal)) {
            setSelectedGoals(selectedGoals.filter((g) => g !== goal));
        } else {
            if (selectedGoals.length >= 3) {
                setError('Tu peux sélectionner maximum 3 objectifs');
                return;
            }
            setSelectedGoals([...selectedGoals, goal]);
        }
    };

    const handleNext = () => {
        if (selectedGoals.length === 0) {
            setError('Sélectionne au moins un objectif');
            return;
        }
        updateData({ goals: selectedGoals });
        onNext();
    };

    return (
        <div className="flex flex-col min-h-screen px-6 py-12 overflow-y-auto">
            <div className="max-w-md w-full mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3"
                >
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-[#94fbdd]/10 rounded-2xl">
                            <TrophyIcon className="h-10 w-10 text-[#94fbdd]" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                        Quels sont tes objectifs ?
                    </h2>
                    <p className="text-gray-400">
                        Sélectionne jusqu'à 3 objectifs
                    </p>
                </motion.div>

                {/* Goals Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 gap-4"
                >
                    {GOAL_OPTIONS.map((goal, index) => {
                        const isSelected = selectedGoals.includes(goal.value);
                        return (
                            <motion.button
                                key={goal.value}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                onClick={() => toggleGoal(goal.value)}
                                className={`relative p-5 rounded-2xl transition-all ${isSelected
                                    ? 'bg-gradient-to-br from-[#94fbdd] to-[#7de3c7] shadow-xl shadow-[#94fbdd]/30'
                                    : 'bg-[#252527] border border-[#94fbdd]/10 hover:border-[#94fbdd]/30'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div
                                        className={`p-3 rounded-xl ${isSelected
                                            ? 'bg-[#121214]/20 text-[#121214]'
                                            : 'bg-[#121214] text-[#94fbdd]'
                                            }`}
                                    >
                                        {goal.icon}
                                    </div>
                                    <div>
                                        <p
                                            className={`font-semibold mb-1 ${isSelected ? 'text-[#121214]' : 'text-white'
                                                }`}
                                        >
                                            {goal.label}
                                        </p>
                                        <p
                                            className={`text-xs ${isSelected
                                                ? 'text-[#121214]/70'
                                                : 'text-gray-400'
                                                }`}
                                        >
                                            {goal.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Check mark */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#121214] rounded-full flex items-center justify-center"
                                    >
                                        <svg
                                            className="w-4 h-4 text-[#94fbdd]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-400 text-center"
                    >
                        {error}
                    </motion.p>
                )}

                {/* Selected count */}
                {selectedGoals.length > 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-center text-gray-400"
                    >
                        {selectedGoals.length} objectif{selectedGoals.length > 1 ? 's' : ''}{' '}
                        sélectionné{selectedGoals.length > 1 ? 's' : ''}
                    </motion.p>
                )}

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl font-medium text-gray-300 bg-[#252527] border border-[#94fbdd]/20 hover:border-[#94fbdd]/40 transition-all"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={selectedGoals.length === 0}
                        className="flex-1 py-3 px-6 rounded-xl font-semibold text-[#121214] bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] hover:from-[#7de3c7] hover:to-[#94fbdd] transition-all shadow-lg shadow-[#94fbdd]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Continuer</span>
                        <ArrowRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
