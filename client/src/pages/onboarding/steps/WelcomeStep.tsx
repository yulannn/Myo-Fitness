import { motion } from 'framer-motion';
import { SparklesIcon, RocketLaunchIcon, FireIcon } from '@heroicons/react/24/solid';

interface WelcomeStepProps {
    onStart: () => void;
}

export default function WelcomeStep({ onStart }: WelcomeStepProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
            <div className="max-w-md w-full space-y-8 text-center">
                {/* Logo animé */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className="flex justify-center"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#94fbdd]/20 rounded-full animate-ping" />
                        <div className="relative bg-gradient-to-br from-[#94fbdd] to-[#7de3c7] p-6 rounded-full">
                            <FireIcon className="h-16 w-16 text-[#121214]" />
                        </div>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="space-y-4"
                >
                    <h1 className="text-4xl font-bold text-white">
                        Bienvenue sur{' '}
                        <span className="bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] bg-clip-text text-transparent">
                            Myo Fitness
                        </span>
                    </h1>
                    <p className="text-lg text-gray-300">
                        Ton compagnon d'entraînement intelligent
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="space-y-4 text-left"
                >
                    {[
                        {
                            icon: <SparklesIcon className="h-6 w-6 text-[#94fbdd]" />,
                            title: 'Programmes personnalisés',
                            description: 'Générés selon tes objectifs et ton niveau',
                        },
                        {
                            icon: <RocketLaunchIcon className="h-6 w-6 text-[#7de3c7]" />,
                            title: 'Suivi intelligent',
                            description: 'Analyse de tes performances en temps réel',
                        },
                        {
                            icon: <FireIcon className="h-6 w-6 text-[#94fbdd]" />,
                            title: 'Communauté active',
                            description: 'Connecte-toi avec d\'autres athlètes',
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                            className="flex items-start gap-4 p-4 bg-[#252527] rounded-2xl border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all"
                        >
                            <div className="p-2 bg-[#121214] rounded-xl shrink-0">
                                {feature.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    onClick={onStart}
                    className="w-full py-4 px-6 rounded-xl font-semibold text-[#121214] bg-gradient-to-r from-[#94fbdd] to-[#7de3c7] hover:from-[#7de3c7] hover:to-[#94fbdd] transition-all shadow-lg shadow-[#94fbdd]/20 hover:shadow-[#94fbdd]/40 hover:scale-105 active:scale-95"
                >
                    Commencer maintenant
                </motion.button>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="text-sm text-gray-500"
                >
                    Seulement 2 minutes pour personnaliser ton expérience
                </motion.p>
            </div>
        </div>
    );
}
