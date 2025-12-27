import { useEffect, useState } from 'react';

interface SessionLoadingOverlayProps {
    isLoading: boolean;
}

/**
 * 🚀 Full-screen overlay displayed while creating ExerciceSessions from template
 * Provides visual feedback for lazy loading process
 */
export default function SessionLoadingOverlay({ isLoading }: SessionLoadingOverlayProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isLoading) {
            setProgress(0);
            return;
        }

        // Animated progress bar (fake but smooth)
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return 90; // Cap at 90%, complete on actual load
                return prev + 10;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isLoading]);

    // Complete progress when loading finishes
    useEffect(() => {
        if (!isLoading && progress > 0) {
            setProgress(100);
            // Reset after animation
            setTimeout(() => setProgress(0), 300);
        }
    }, [isLoading, progress]);

    if (!isLoading && progress === 0) return null;

    return (
        <div className="fixed inset-0 z-50 bg-[#121214]/95 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center px-6">
                {/* Animated icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-[#94fbdd]/20"></div>
                    <div
                        className="absolute inset-0 rounded-full border-4 border-[#94fbdd] border-t-transparent animate-spin"
                        style={{ animationDuration: '1s' }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-10 h-10 text-[#94fbdd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>

                {/* Loading text */}
                <h3 className="text-2xl font-bold text-white mb-2">
                    Préparation de la séance
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                    Sélection des exercices selon vos objectifs...
                </p>

                {/* Progress bar */}
                <div className="w-64 h-2 bg-[#252527] rounded-full overflow-hidden mx-auto">
                    <div
                        className="h-full bg-gradient-to-r from-[#94fbdd] to-[#7de0c4] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
