import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercicesByUser } from '../../api/hooks/exercice/useGetExercicesByUser';
import { MagnifyingGlassIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../components/ui/modal';
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
                                                (e.target as HTMLImageElement).parentElement!.innerText = '🏋️‍♂️';
                                                (e.target as HTMLImageElement).parentElement!.className += ' flex items-center justify-center text-2xl';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                            🏋️‍♂️
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
            <Modal
                isOpen={!!selectedExercise}
                onClose={() => setSelectedExercise(null)}
                showClose={false}
                className="!p-0 !bg-transparent !border-none !shadow-none !max-w-none flex items-center justify-center pointer-events-none"
            >
                <div className="bg-[#18181b] w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 pointer-events-auto max-h-[85vh] flex flex-col">
                    {selectedExercise && (
                        <>
                            {/* Header Image */}
                            <div className="relative h-48 w-full bg-[#252527] flex-shrink-0">
                                <button
                                    onClick={() => setSelectedExercise(null)}
                                    className="absolute top-4 right-4 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>

                                {getExerciseImageUrl(selectedExercise.imageUrl) ? (
                                    <img
                                        src={getExerciseImageUrl(selectedExercise.imageUrl)!}
                                        alt={selectedExercise.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                            (e.target as HTMLImageElement).parentElement!.innerHTML += '<span class="text-4xl">🏋️‍♂️</span>';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">
                                        🏋️‍♂️
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent opacity-80" />

                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <h2 className="text-2xl font-bold text-white drop-shadow-md leading-tight">
                                        {selectedExercise.name}
                                    </h2>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6 overflow-y-auto">
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {selectedExercise.groupes?.map((g, i) => (
                                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold ${g.isPrimary ? 'bg-[#94fbdd] text-[#121214]' : 'bg-white/5 text-gray-300'}`}>
                                            {g.groupe.name}
                                        </span>
                                    ))}
                                    {selectedExercise.bodyWeight && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                                            Poids du corps
                                        </span>
                                    )}
                                    {selectedExercise.isDefault && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                                            Officiel
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {selectedExercise.description && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {selectedExercise.description}
                                        </p>
                                    </div>
                                )}

                                {/* Additional Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#252527] p-3 rounded-xl border border-white/5">
                                        <div className="text-xs text-gray-500 mb-1">Difficulté</div>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`h-1.5 w-full rounded-full ${i < selectedExercise.difficulty ? 'bg-[#94fbdd]' : 'bg-white/10'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-[#252527] p-3 rounded-xl border border-white/5">
                                        <div className="text-xs text-gray-500 mb-1">Type</div>
                                        <div className="text-sm font-medium text-white">
                                            {selectedExercise.bodyWeight ? 'Calisthénie' : 'Musculation'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}
