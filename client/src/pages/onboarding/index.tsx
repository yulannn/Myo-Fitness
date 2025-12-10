import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useCreateFitnessProfile } from '../../api/hooks/fitness-profile/useCreateFitnessProfile';
import { logAnalyticsEvent, AnalyticsEvents } from '../../utils/analytics';

// Steps
import WelcomeStep from './steps/WelcomeStep.tsx';
import BasicInfoStep from './steps/BasicInfoStep.tsx';
import GoalsStep from './steps/GoalsStep.tsx';
import ExperienceStep from './steps/ExperienceStep.tsx';
import FrequencyStep from './steps/FrequencyStep.tsx';
import TrainingDaysStep from './steps/TrainingDaysStep.tsx';

export default function Onboarding() {
    const navigate = useNavigate();
    const {
        currentStep,
        data,
        nextStep,
        previousStep,
        completeOnboarding,
        isCompleted,
    } = useOnboardingStore();

    const createProfile = useCreateFitnessProfile();

    // Rediriger si déjà complété
    useEffect(() => {
        if (isCompleted) {
            navigate('/', { replace: true });
        }
    }, [isCompleted, navigate]);

    // Analytics
    useEffect(() => {
        logAnalyticsEvent(AnalyticsEvents.PAGE_VIEW, {
            page_title: `Onboarding - Step ${currentStep}`,
        });
    }, [currentStep]);

    const handleComplete = async () => {
        try {
            // Valider les données
            if (
                !data.age ||
                !data.gender ||
                !data.height ||
                !data.weight ||
                !data.experienceLevel ||
                !data.trainingFrequency ||
                !data.goals ||
                data.goals.length === 0
            ) {
                console.error('Missing required onboarding data');
                return;
            }

            // Créer le profile fitness
            await createProfile.mutateAsync({
                age: data.age,
                gender: data.gender,
                height: data.height,
                weight: data.weight,
                city: data.city || null,
                experienceLevel: data.experienceLevel,
                trainingFrequency: data.trainingFrequency,
                bodyWeight: data.bodyWeight ?? false,
                goals: data.goals,
                trainingDays: data.trainingDays,
            });

            // Marquer comme complété
            completeOnboarding();

            // Analytics
            logAnalyticsEvent('onboarding_completed', {
                experience_level: data.experienceLevel,
                goals: data.goals.join(','),
            });

            // Rediriger vers la home
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Failed to create fitness profile:', error);
        }
    };

    const steps = [
        <WelcomeStep key="welcome" onStart={nextStep} />,
        <BasicInfoStep key="basic" onNext={nextStep} onBack={previousStep} />,
        <GoalsStep key="goals" onNext={nextStep} onBack={previousStep} />,
        <ExperienceStep key="experience" onNext={nextStep} onBack={previousStep} />,
        <FrequencyStep key="frequency" onNext={nextStep} onBack={previousStep} />,
        <TrainingDaysStep
            key="days"
            onComplete={handleComplete}
            onBack={previousStep}
            isLoading={createProfile.isPending}
        />,
    ];

    return (
        <div className="min-h-screen bg-[#121214] overflow-hidden">
            {/* Progress Bar */}
            {currentStep > 0 && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-[#252527]/80 backdrop-blur-sm">
                    <div className="max-w-2xl mx-auto px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-[#121214] rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#94fbdd] to-[#7de3c7]"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(currentStep / (steps.length - 1)) * 100}%`,
                                    }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-400">
                                {currentStep}/{steps.length - 1}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-screen"
                >
                    {steps[currentStep]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
