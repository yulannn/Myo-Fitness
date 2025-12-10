import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { FireIcon } from '@heroicons/react/24/solid';

interface FrequencyStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function FrequencyStep({ onNext, onBack }: FrequencyStepProps) {
    const { data, updateData } = useOnboardingStore();
    const [trainingFrequency, setTrainingFrequency] = useState(
        data.trainingFrequency || 3
    );
    const [bodyWeight, setBodyWeight] = useState(data.bodyWeight ?? false);
    const [error, setError] = useState('');

    const handleNext = () => {
        if (trainingFrequency < 1 || trainingFrequency > 7) {
            setError('Fréquence invalide (1-7 jours/semaine)');
            return;
        }
        updateData({ trainingFrequency, bodyWeight });
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
                            <FireIcon className="h-10 w-10 text-[#94fbdd]" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Ton rythme</h2>
                    <p className="text-gray-400">
                        Configure ta fréquence d'entraînement
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Training Frequency */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300">
                            Fréquence d'entraînement
                        </label>
                        <div className="bg-[#252527] rounded-xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-white">
                                    {trainingFrequency}
                                </span>
                                <span className="text-gray-400">jours/semaine</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="7"
                                value={trainingFrequency}
                                onChange={(e) => setTrainingFrequency(parseInt(e.target.value))}
                                className="w-full h-2 bg-[#121214] rounded-lg appearance-none cursor-pointer accent-[#94fbdd]"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                                <span>6</span>
                                <span>7</span>
                            </div>
                        </div>
                    </div>

                    {/* Body Weight Option */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300">
                            Entraînement au poids du corps
                        </label>
                        <button
                            type="button"
                            onClick={() => setBodyWeight(!bodyWeight)}
                            className={`w-full p-4 rounded-xl transition-all flex items-center justify-between ${bodyWeight
                                    ? 'bg-gradient-to-r from-[#94fbdd] to-[#7de3c7]'
                                    : 'bg-[#252527] border border-[#94fbdd]/10'
                                }`}
                        >
                            <span
                                className={`font-medium ${bodyWeight ? 'text-[#121214]' : 'text-white'
                                    }`}
                            >
                                Je préfère m'entraîner sans matériel
                            </span>
                            <div
                                className={`w-12 h-6 rounded-full relative transition-all ${bodyWeight ? 'bg-[#121214]/20' : 'bg-[#121214]'
                                    }`}
                            >
                                <motion.div
                                    className={`absolute top-0.5 w-5 h-5 rounded-full ${bodyWeight ? 'bg-[#121214]' : 'bg-[#94fbdd]'
                                        }`}
                                    animate={{ left: bodyWeight ? '24px' : '2px' }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </div>
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}
                </motion.div>

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
                        className="flex-1 py-3 px-6 rounded-xl font-semibold text-[#121214] bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] hover:from-[#7de3c7] hover:to-[#94fbdd] transition-all shadow-lg shadow-[#94fbdd]/20 flex items-center justify-center gap-2"
                    >
                        <span>Continuer</span>
                        <ArrowRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
