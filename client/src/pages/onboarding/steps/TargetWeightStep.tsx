import { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { motion } from 'framer-motion';
import { Target, ArrowRight, ArrowLeft } from 'lucide-react';

interface TargetWeightStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function TargetWeightStep({ onNext, onBack }: TargetWeightStepProps) {
    const { data, updateData } = useOnboardingStore();
    const [targetWeight, setTargetWeight] = useState<string>(data.targetWeight?.toString() || '');
    const [hasGoal, setHasGoal] = useState<boolean>(!!data.targetWeight);

    useEffect(() => {
        if (data.targetWeight) {
            setTargetWeight(data.targetWeight.toString());
            setHasGoal(true);
        }
    }, [data.targetWeight]);

    const handleNext = () => {
        if (hasGoal && targetWeight) {
            const weight = parseFloat(targetWeight);
            if (weight >= 30 && weight <= 250) {
                updateData({ targetWeight: weight });
                onNext();
            }
        } else {
            updateData({ targetWeight: undefined });
            onNext();
        }
    };

    const handleSkip = () => {
        setHasGoal(false);
        updateData({ targetWeight: undefined });
        onNext();
    };

    const delta = data.weight && targetWeight ? parseFloat(targetWeight) - data.weight : null;

    return (
        <div className="min-h-screen bg-[#121214] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#94fbdd]/20 to-[#7de3c7]/20 mb-6">
                        <Target className="w-8 h-8 text-[#94fbdd]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">
                        Quel est votre objectif de poids ?
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Cela nous aidera à personnaliser votre programme (optionnel)
                    </p>
                    {data.weight && (
                        <p className="text-gray-500 text-sm mt-2">
                            Poids actuel: <span className="text-[#94fbdd] font-semibold">{data.weight} kg</span>
                        </p>
                    )}
                </div>

                {/* Toggle Goal */}
                <div className="mb-8 space-y-4">
                    <button
                        onClick={() => setHasGoal(true)}
                        className={`w-full p-5 rounded-2xl border-2 transition-all ${hasGoal
                            ? 'border-[#94fbdd] bg-[#94fbdd]/10'
                            : 'border-gray-700 bg-[#1a1a1d] hover:border-gray-600'
                            }`}
                    >
                        <p className="text-white font-medium">J'ai un objectif de poids</p>
                    </button>

                    <button
                        onClick={handleSkip}
                        className={`w-full p-5 rounded-2xl border-2 transition-all ${!hasGoal
                            ? 'border-[#94fbdd] bg-[#94fbdd]/10'
                            : 'border-gray-700 bg-[#1a1a1d] hover:border-gray-600'
                            }`}
                    >
                        <p className="text-white font-medium">Je n'ai pas d'objectif de poids précis</p>
                    </button>
                </div>

                {/* Weight Input */}
                {hasGoal && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <div className="bg-[#1a1a1d] rounded-2xl border-2 border-gray-700 p-6">
                            <label className="block text-gray-300 font-medium mb-3">
                                Objectif de poids (kg)
                            </label>
                            <input
                                type="number"
                                min="30"
                                max="250"
                                step="0.1"
                                value={targetWeight}
                                onChange={(e) => setTargetWeight(e.target.value)}
                                className="w-full bg-[#121214] border-2 border-gray-600 rounded-xl px-4 py-3 text-white text-lg focus:border-[#94fbdd] focus:outline-none transition-colors"
                                placeholder="Ex: 75"
                            />
                            {delta !== null && targetWeight && (
                                <p className={`mt-3 text-sm ${delta > 0 ? 'text-green-400' : delta < 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                                    {delta > 0 && `+${delta.toFixed(1)} kg à gagner`}
                                    {delta < 0 && `${Math.abs(delta).toFixed(1)} kg à perdre`}
                                    {delta === 0 && 'Maintien du poids actuel'}
                                </p>
                            )}
                        </div>
                    </motion.div>
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
                        disabled={hasGoal && (!targetWeight || parseFloat(targetWeight) < 30 || parseFloat(targetWeight) > 250)}
                        className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] text-[#121214] font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continuer
                        <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
