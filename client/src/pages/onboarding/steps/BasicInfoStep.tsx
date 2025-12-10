import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/solid';
import type { Gender } from '../../../types/fitness-profile.type';

interface BasicInfoStepProps {
    onNext: () => void;
    onBack: () => void;
}

export default function BasicInfoStep({ onNext, onBack }: BasicInfoStepProps) {
    const { data, updateData } = useOnboardingStore();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        age: data.age || 0,
        gender: data.gender || 'MALE' as Gender,
        height: data.height || 0,
        weight: data.weight || 0,
    });

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.age || formData.age < 13 || formData.age > 100) {
            newErrors.age = 'Âge invalide (13-100)';
        }
        if (!formData.height || formData.height < 100 || formData.height > 250) {
            newErrors.height = 'Taille invalide (100-250 cm)';
        }
        if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
            newErrors.weight = 'Poids invalide (30-300 kg)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            updateData(formData);
            onNext();
        }
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
                            <UserIcon className="h-10 w-10 text-[#94fbdd]" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                        Parle-nous de toi
                    </h2>
                    <p className="text-gray-400">
                        Ces infos nous aident à créer ton programme parfait
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Gender */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300">Sexe</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'MALE' as Gender, label: '👨 Homme' },
                                { value: 'FEMALE' as Gender, label: '👩 Femme' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleChange('gender', option.value)}
                                    className={`py-4 px-6 rounded-xl font-medium transition-all ${formData.gender === option.value
                                        ? 'bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] text-[#121214] shadow-lg shadow-[#94fbdd]/20'
                                        : 'bg-[#252527] text-gray-300 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Âge</label>
                        <input
                            type="number"
                            value={formData.age || ''}
                            onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                            placeholder="25"
                            className={`w-full rounded-xl bg-[#252527] border px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all ${errors.age ? 'border-red-500' : 'border-[#94fbdd]/20'
                                }`}
                        />
                        {errors.age && <p className="text-sm text-red-400">{errors.age}</p>}
                    </div>

                    {/* Height */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Taille (cm)
                        </label>
                        <input
                            type="number"
                            value={formData.height || ''}
                            onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
                            placeholder="175"
                            className={`w-full rounded-xl bg-[#252527] border px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all ${errors.height ? 'border-red-500' : 'border-[#94fbdd]/20'
                                }`}
                        />
                        {errors.height && <p className="text-sm text-red-400">{errors.height}</p>}
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Poids (kg)
                        </label>
                        <input
                            type="number"
                            value={formData.weight || ''}
                            onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                            placeholder="70"
                            className={`w-full rounded-xl bg-[#252527] border px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all ${errors.weight ? 'border-red-500' : 'border-[#94fbdd]/20'
                                }`}
                        />
                        {errors.weight && <p className="text-sm text-red-400">{errors.weight}</p>}
                    </div>
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
