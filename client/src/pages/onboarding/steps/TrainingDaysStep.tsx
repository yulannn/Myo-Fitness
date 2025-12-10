import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { CalendarIcon } from '@heroicons/react/24/solid';
import type { WeekDay } from '../../../types/fitness-profile.type';

interface TrainingDaysStepProps {
    onComplete: () => void;
    onBack: () => void;
    isLoading: boolean;
}

const WEEK_DAYS: Array<{ value: WeekDay; label: string; short: string }> = [
    { value: 'MONDAY', label: 'Lundi', short: 'L' },
    { value: 'TUESDAY', label: 'Mardi', short: 'M' },
    { value: 'WEDNESDAY', label: 'Mercredi', short: 'M' },
    { value: 'THURSDAY', label: 'Jeudi', short: 'J' },
    { value: 'FRIDAY', label: 'Vendredi', short: 'V' },
    { value: 'SATURDAY', label: 'Samedi', short: 'S' },
    { value: 'SUNDAY', label: 'Dimanche', short: 'D' },
];

export default function TrainingDaysStep({ onComplete, onBack, isLoading }: TrainingDaysStepProps) {
    const { data, updateData } = useOnboardingStore();
    const [selectedDays, setSelectedDays] = useState<WeekDay[]>(data.trainingDays || []);
    const maxSelections = data.trainingFrequency || 3;

    const toggleDay = (day: WeekDay) => {
        let newDays: WeekDay[];
        if (selectedDays.includes(day)) {
            newDays = selectedDays.filter((d) => d !== day);
        } else {
            if (selectedDays.length < maxSelections) {
                newDays = [...selectedDays, day];
            } else {
                return; // Don't update if max reached
            }
        }
        setSelectedDays(newDays);
        // ✅ Update store immediately!
        updateData({ trainingDays: newDays });
    };

    const handleComplete = () => {
        // Data is already in the store, just call onComplete
        onComplete();
    };

    const canSkip = selectedDays.length === 0;

    return (
        <div className="flex flex-col min-h-screen px-6 py-8 overflow-y-auto">
            <div className="max-w-md w-full mx-auto space-y-5">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2"
                >
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-[#94fbdd]/10 rounded-2xl">
                            <CalendarIcon className="h-8 w-8 text-[#94fbdd]" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        Quand t'entraînes-tu ?
                    </h2>
                    <p className="text-gray-400">
                        Sélectionne tes jours préférés ({selectedDays.length}/{maxSelections})
                    </p>
                    <p className="text-sm text-gray-500">Cette étape est optionnelle</p>
                </motion.div>

                {/* Days Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {WEEK_DAYS.map((day, index) => {
                        const isSelected = selectedDays.includes(day.value);
                        const isDisabled =
                            !isSelected && selectedDays.length >= maxSelections;

                        return (
                            <motion.button
                                key={day.value}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                onClick={() => toggleDay(day.value)}
                                disabled={isDisabled}
                                className={`relative p-4 rounded-xl transition-all ${isSelected
                                    ? 'bg-gradient-to-br from-[#94fbdd] to-[#7de3c7] shadow-xl shadow-[#94fbdd]/30'
                                    : isDisabled
                                        ? 'bg-[#252527]/50 border border-[#94fbdd]/5 opacity-50 cursor-not-allowed'
                                        : 'bg-[#252527] border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 hover:scale-105'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center gap-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isSelected
                                            ? 'bg-[#121214]/20 text-[#121214]'
                                            : 'bg-[#121214] text-[#94fbdd]'
                                            }`}
                                    >
                                        {day.short}
                                    </div>
                                    <p
                                        className={`font-medium text-xs ${isSelected ? 'text-[#121214]' : 'text-white'
                                            }`}
                                    >
                                        {day.label}
                                    </p>
                                </div>

                                {/* Check mark */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#121214] rounded-full flex items-center justify-center"
                                    >
                                        <CheckIcon className="w-4 h-4 text-[#94fbdd] stroke-[3]" />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* Info message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-[#252527] border border-[#94fbdd]/10 rounded-xl p-3"
                >
                    <p className="text-xs text-gray-400 text-center">
                        💡 Ces jours nous aident à planifier tes programmes d'entraînement
                    </p>
                </motion.div>

                {/* Navigation */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onBack}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl font-medium text-gray-300 bg-[#252527] border border-[#94fbdd]/20 hover:border-[#94fbdd]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="flex-1 py-3 px-6 rounded-xl font-semibold text-[#121214] bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] hover:from-[#7de3c7] hover:to-[#94fbdd] transition-all shadow-lg shadow-[#94fbdd]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#121214] border-t-transparent" />
                                <span>Création en cours...</span>
                            </>
                        ) : (
                            <>
                                <CheckIcon className="h-5 w-5" />
                                <span>{canSkip ? 'Passer' : 'Terminer'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
