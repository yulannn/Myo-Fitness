import React from 'react';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function ComingSoonModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b border-white/5 flex justify-end items-center bg-[#121212]">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                        <ClockIcon className="w-8 h-8 text-white" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-white">Bientôt disponible</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            L'application Myo Fitness est encore en cours de développement.
                            Nous travaillons dur pour vous offrir la meilleure expérience possible.
                        </p>
                    </div>

                    <div className="pt-4 w-full">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Compris
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
