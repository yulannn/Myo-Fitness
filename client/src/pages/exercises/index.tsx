import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercicesByUser } from '../../api/hooks/exercice/useGetExercicesByUser';
import { MagnifyingGlassIcon, ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ExerciseDetailModal } from '../../components/exercises';
import type { Exercice } from '../../types/exercice.type';

export default function ExercisesPage() {
    const navigate = useNavigate();
    const { data: exercises, isLoading } = useExercicesByUser();
    const [search, setSearch] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<Exercice | null>(null);
    const [filterBodyWeight, setFilterBodyWeight] = useState<boolean | null>(null); // null = all, true = bw, false = weights
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const getExerciseImageUrl = (imageUrl: string | null | undefined) => {
        if (!imageUrl) return null;
        return imageUrl.startsWith('http')
            ? imageUrl
            : `${API_URL}/assets/exercises_illustration/${imageUrl}`;
    };

    // Extract unique muscle groups for filter
    const uniqueMuscleGroups = useMemo(() => {
        if (!exercises) return [];
        const groups = new Set<string>();
        exercises.forEach(ex => {
            ex.groupes?.forEach(g => groups.add(g.groupe.name));
        });
        return Array.from(groups).sort();
    }, [exercises]);


    const filteredExercises = useMemo(() => {
        if (!exercises) return [];
        return exercises.filter(ex => {
            // 1. Hide user created exercises (keep only default system ones)
            if (!ex.isDefault) return false;

            // 2. Search
            const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
            if (!matchesSearch) return false;

            // 3. BodyWeight Filter
            if (filterBodyWeight !== null) {
                if (filterBodyWeight !== ex.bodyWeight) return false;
            }

            // 4. Muscle Group Filter
            if (selectedMuscleGroup) {
                const hasGroup = ex.groupes?.some(g => g.groupe.name === selectedMuscleGroup);
                if (!hasGroup) return false;
            }

            return true;
        });
    }, [exercises, search, filterBodyWeight, selectedMuscleGroup]);

    return (
        <div className="min-h-screen bg-[#121214] pb-24 font-sans text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#121214]/80 backdrop-blur-md border-b border-white/5 px-4 py-4 safe-top">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-xl font-bold">Bibliothèque d'exercices</h1>
                </div>

                {/* Search */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher un exercice..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#94fbdd]/50 focus:ring-1 focus:ring-[#94fbdd]/50 transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="mt-4 space-y-3">
                    {/* Type Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterBodyWeight(null)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterBodyWeight === null
                                ? 'bg-white text-black'
                                : 'bg-[#18181b] text-gray-400 hover:text-white border border-white/5'
                                }`}
                        >
                            Tout
                        </button>
                        <button
                            onClick={() => setFilterBodyWeight(true)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterBodyWeight === true
                                ? 'bg-[#94fbdd] text-black'
                                : 'bg-[#18181b] text-gray-400 hover:text-white border border-white/5'
                                }`}
                        >
                            Poids du corps
                        </button>
                        <button
                            onClick={() => setFilterBodyWeight(false)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterBodyWeight === false
                                ? 'bg-blue-400 text-black'
                                : 'bg-[#18181b] text-gray-400 hover:text-white border border-white/5'
                                }`}
                        >
                            Musculation
                        </button>
                    </div>

                    {/* Muscle Groups Horizontal Scroll */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                        <button
                            onClick={() => setSelectedMuscleGroup(null)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap border ${selectedMuscleGroup === null
                                ? 'bg-white border-white text-black'
                                : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            Tout
                        </button>
                        {uniqueMuscleGroups.map(group => (
                            <button
                                key={group}
                                onClick={() => setSelectedMuscleGroup(group === selectedMuscleGroup ? null : group)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap border ${selectedMuscleGroup === group
                                    ? 'bg-[#94fbdd] border-[#94fbdd] text-black'
                                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                    }`}
                            >
                                {group}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="px-4 py-4 grid grid-cols-1 gap-3">
                {isLoading ? (
                    // Skeletons
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-[#18181b] rounded-xl animate-pulse" />
                    ))
                ) : filteredExercises.length > 0 ? (
                    filteredExercises.map((exercise) => {
                        const imageUrl = getExerciseImageUrl(exercise.imageUrl);

                        return (
                            <button
                                key={exercise.id}
                                onClick={() => setSelectedExercise(exercise)}
                                className="w-full flex items-center gap-4 p-3 bg-[#18181b] border border-white/5 rounded-xl hover:bg-[#202024] hover:border-[#94fbdd]/30 transition-all group text-left"
                            >
                                {/* Image / Icon */}
                                <div className="relative w-16 h-16 rounded-lg bg-[#252527] overflow-hidden flex-shrink-0 border border-white/5">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={exercise.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                const parent = (e.target as HTMLImageElement).parentElement!;
                                                parent.className += ' flex items-center justify-center text-2xl';

                                                if (exercise.isDefault === false) {
                                                    parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>`;
                                                } else {
                                                    parent.innerText = '🏋️‍♂️';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                            {exercise.isDefault === false ? (
                                                <DocumentTextIcon className="w-8 h-8 text-gray-500" />
                                            ) : (
                                                "🏋️‍♂️"
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-200 group-hover:text-white truncate pr-2">
                                        {exercise.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {exercise.groupes && exercise.groupes.length > 0 && (
                                            <span className="text-xs text-[#94fbdd] bg-[#94fbdd]/10 px-2 py-0.5 rounded-full truncate">
                                                {exercise.groupes.find(g => g.isPrimary)?.groupe.name || exercise.groupes[0].groupe.name}
                                            </span>
                                        )}
                                        {exercise.bodyWeight && (
                                            <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                                                Poids du corps
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>Aucun exercice trouvé.</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <ExerciseDetailModal
                isOpen={!!selectedExercise}
                onClose={() => setSelectedExercise(null)}
                exercise={selectedExercise}
            />
        </div>
    );
}
