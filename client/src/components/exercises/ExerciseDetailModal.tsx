import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Modal } from '../ui/modal';
import { getExerciseImageUrl } from '../../utils/imageUtils';

// You might need to adjust this import based on where the type is defined
// Based on ExercisesPage.tsx it was imported from '../../types/exercice.type'
import type { Exercice } from '../../types/exercice.type';

interface ExerciseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercise: Exercice | null;
}

export const ExerciseDetailModal = ({ isOpen, onClose, exercise }: ExerciseDetailModalProps) => {
    if (!exercise) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showClose={false}
            className="!p-0 !bg-transparent !border-none !shadow-none !max-w-none flex items-center justify-center pointer-events-none"
        >
            <div className="bg-[#18181b] w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 pointer-events-auto max-h-[85vh] flex flex-col">
                {/* Header Image */}
                <div className="relative h-48 w-full bg-[#252527] flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    {getExerciseImageUrl(exercise.imageUrl) ? (
                        <img
                            src={getExerciseImageUrl(exercise.imageUrl)!}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement!;
                                parent.classList.add('flex', 'items-center', 'justify-center');
                                if (!exercise.isDefault) {
                                    parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-gray-600"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>`;
                                } else {
                                    parent.innerHTML = '<span class="text-4xl">🏋️‍♂️</span>';
                                }
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">
                            {!exercise.isDefault ? (
                                <DocumentTextIcon className="w-16 h-16 text-gray-600" />
                            ) : (
                                "🏋️‍♂️"
                            )}
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent opacity-80" />

                    <div className="absolute bottom-0 left-0 p-6 w-full">
                        <h2 className="text-2xl font-bold text-white drop-shadow-md leading-tight">
                            {exercise.name}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {exercise.groupes?.map((g, i) => (
                            <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold ${g.isPrimary ? 'bg-[#94fbdd] text-[#121214]' : 'bg-white/5 text-gray-300'}`}>
                                {g.groupe.name}
                            </span>
                        ))}
                        {exercise.bodyWeight && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                                Poids du corps
                            </span>
                        )}
                        {exercise.isDefault ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                                Officiel
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                                Créé par vous
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {exercise.description && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {exercise.description}
                            </p>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#252527] p-3 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 mb-1">Difficulté</div>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-1.5 w-full rounded-full ${i < exercise.difficulty ? 'bg-[#94fbdd]' : 'bg-white/10'}`} />
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#252527] p-3 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 mb-1">Type</div>
                            <div className="text-sm font-medium text-white">
                                {exercise.bodyWeight ? 'Calisthénie' : 'Musculation'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
