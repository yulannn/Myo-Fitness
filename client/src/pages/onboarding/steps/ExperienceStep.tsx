import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { AcademicCapIcon, RocketLaunchIcon, StarIcon } from '@heroicons/react/24/solid';
import type { ExperienceLevel } from '../../../types/fitness-profile.type';

interface ExperienceStepProps {
    onNext: () => void;
    onBack: () => void;
}

const EXPERIENCE_LEVELS: Array<{
    value: ExperienceLevel;
    label: string;
    icon: ReactNode;
    desc: string;
}> = [
        {
            value: 'BEGINNER',
            label: 'Débutant',
            icon: <AcademicCapIcon className="h-8 w-8" />,
            desc: 'Je débute ou reprends après une pause',
        },
        {
            value: 'INTERMEDIATE',
            label: 'Intermédiaire',
            icon: <RocketLaunchIcon className="h-8 w-8" />,
            desc: 'Je m\'entraîne régulièrement',
        },
        {
            value: 'ADVANCED',
            label: 'Avancé',
            icon: <StarIcon className="h-8 w-8" />,
            desc: 'Je suis un athlète expérimenté',
        },
    ];

export default function ExperienceStep({ onNext, onBack }: ExperienceStepProps) {
    const { data, updateData } = useOnboardingStore();
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
        data.experienceLevel || 'BEGINNER'
    );

    const handleNext = () => {
        updateData({ experienceLevel });
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
                            <StarIcon className="h-10 w-10 text-[#94fbdd]" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Ton expérience</h2>
                    <p className="text-gray-400">
                        Quel est ton niveau actuel ?
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    {/* Experience Level */}
                    {EXPERIENCE_LEVELS.map((level, index) => (
                        <motion.button
                            key={level.value}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            onClick={() => setExperienceLevel(level.value)}
                            className={`w-full p-4 rounded-xl transition-all flex items-center gap-4 ${experienceLevel === level.value
                                    ? 'bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] shadow-lg shadow-[#94fbdd]/20'
                                    : 'bg-[#252527] border border-[#94fbdd]/10 hover:border-[#94fbdd]/30'
                                }`}
                        >
                            <div
                                className={`p-3 rounded-xl ${experienceLevel === level.value
                                        ? 'bg-[#121214]/20 text-[#121214]'
                                        : 'bg-[#121214] text-[#94fbdd]'
                                    }`}
                            >
                                {level.icon}
                            </div>
                            <div className="flex-1 text-left">
                                <p
                                    className={`font-semibold ${experienceLevel === level.value
                                            ? 'text-[#121214]'
                                            : 'text-white'
                                        }`}
                                >
                                    {level.label}
                                </p>
                                <p
                                    className={`text-sm ${experienceLevel === level.value
                                            ? 'text-[#121214]/70'
                                            : 'text-gray-400'
                                        }`}
                                >
                                    {level.desc}
                                </p>
                            </div>
                        </motion.button>
                    ))}
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
