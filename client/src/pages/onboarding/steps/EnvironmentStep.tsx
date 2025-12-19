import { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { motion } from 'framer-motion';
import { Dumbbell, ArrowRight, ArrowLeft, Home, Building2 } from 'lucide-react';
import type { TrainingEnvironment } from '../../../types/fitness-profile.type';

interface EnvironmentStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function EnvironmentStep({ onNext, onBack }: EnvironmentStepProps) {
    const { data, updateData } = useOnboardingStore();
    const [environment, setEnvironment] = useState<TrainingEnvironment>(data.trainingEnvironment || 'GYM');

    useEffect(() => {
        if (data.trainingEnvironment) {
            setEnvironment(data.trainingEnvironment);
        }
    }, [data.trainingEnvironment]);

    const handleNext = () => {
        updateData({ trainingEnvironment: environment });
        onNext();
    };

    const environments: { value: TrainingEnvironment; label: string; icon: any; description: string }[] = [
        {
            value: 'HOME',
            label: 'Maison',
            icon: Home,
            description: 'Exercices au poids du corps et équipement minimal',
        },
        {
            value: 'GYM',
            label: 'Salle de sport',
            icon: Building2,
            description: 'Accès à tous les équipements',
        },
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
                        <Dumbbell className="w-8 h-8 text-[#94fbdd]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">
                        Où vous entraînez-vous ?
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Cela nous aidera à adapter les exercices à votre environnement
                    </p>
                </div>

                {/* Environment Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    {environments.map((env) => {
                        const Icon = env.icon;
                        const isSelected = environment === env.value;

                        return (
                            <button
                                key={env.value}
                                onClick={() => setEnvironment(env.value)}
                                className={`p-6 rounded-2xl border-2 transition-all ${isSelected
                                        ? 'border-[#94fbdd] bg-[#94fbdd]/10'
                                        : 'border-gray-700 bg-[#1a1a1d] hover:border-gray-600'
                                    }`}
                            >
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${isSelected ? 'bg-[#94fbdd]/20' : 'bg-gray-700/30'
                                    }`}>
                                    <Icon className={`w-7 h-7 ${isSelected ? 'text-[#94fbdd]' : 'text-gray-400'}`} />
                                </div>
                                <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                    {env.label}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {env.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

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
