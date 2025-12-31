import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExerciceById } from '../../api/hooks/exercice/useGetExerciceById';
import { useUpdateExercice } from '../../api/hooks/exercice/useUpdateExercice';
import { useMuscleGroups } from '../../api/hooks/muscle-group/useGetMuscleGroups';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const EditExercisePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const exerciseId = parseInt(id || '0', 10);

    const { data: exercise, isLoading } = useExerciceById(exerciseId);
    const { data: muscleGroups = [] } = useMuscleGroups();
    const updateMutation = useUpdateExercice(exerciseId);

    const [name, setName] = useState('');
    const [muscleGroupIds, setMuscleGroupIds] = useState<number[]>([]);
    const [isBodyweight, setIsBodyweight] = useState(false);

    useEffect(() => {
        if (exercise) {
            setName(exercise.name);
            setIsBodyweight(exercise.bodyWeight || false);
            if (exercise.groupes && exercise.groupes.length > 0) {
                const ids = exercise.groupes.map((g: any) => {
                    return g.muscleGroupeId || g.groupeId || g.groupe?.id;
                });
                setMuscleGroupIds(ids.filter((id): id is number => id !== undefined));
            }
        }
    }, [exercise]);

    const handleSave = async () => {
        if (!name.trim() || muscleGroupIds.length === 0) return;

        const payload = {
            name: name.trim(),
            bodyWeight: isBodyweight,
            Materials: !isBodyweight,
            muscleGroupIds: muscleGroupIds,
            difficulty: exercise?.difficulty || 3,
        };

        try {
            await updateMutation.mutateAsync(payload);
            navigate('/my-exercises');
        } catch (error: any) {
            console.error('Failed to update exercise:', error);
            console.error('Error response:', error.response?.data);
            alert(`Erreur: ${error.response?.data?.message || 'Impossible de mettre à jour l\'exercice'}`);
        }
    };

    const toggleMuscleGroup = (groupId: number) => {
        setMuscleGroupIds(prev =>
            prev.includes(groupId)
                ? prev.filter(mid => mid !== groupId)
                : [...prev, groupId]
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#121214]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#94fbdd]/20 border-t-[#94fbdd]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-[#94fbdd]/20 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#121214] flex-col gap-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-xl font-bold text-white">Exercice introuvable</p>
                    <p className="text-gray-500 text-sm">Cet exercice n'existe pas ou a été supprimé</p>
                </div>
                <button
                    onClick={() => navigate('/my-exercises')}
                    className="px-6 py-3 rounded-lg bg-[#94fbdd] text-[#09090b] font-semibold hover:bg-[#7de0c4] transition-all"
                >
                    Retour à mes exercices
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#121214] min-h-screen pb-24">
            {/* Header */}
            <div className="bg-[#121214]">
                <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/my-exercises')}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-medium text-white">
                            Modifier l'exercice
                        </h1>
                    </div>
                </div>
                <div className="h-px bg-white/5" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">
                                Nom de l'exercice
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Développé couché..."
                                className="w-full px-4 py-3 rounded-lg bg-[#1c1c1e] border border-white/10 text-white placeholder:text-gray-600 focus:border-[#94fbdd] focus:outline-none transition-all"
                            />
                        </div>

                        {/* Muscle Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">
                                Muscles ciblés
                                <span className="text-xs text-gray-600 ml-2">(le premier sera principal)</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {muscleGroups.map((group) => {
                                    const isSelected = muscleGroupIds.includes(group.id);
                                    const isPrimary = muscleGroupIds[0] === group.id;

                                    return (
                                        <button
                                            key={group.id}
                                            onClick={() => toggleMuscleGroup(group.id)}
                                            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isSelected
                                                    ? 'bg-[#94fbdd] text-[#09090b]'
                                                    : 'bg-[#1c1c1e] text-gray-400 hover:bg-[#252527] border border-white/5'
                                                }`}
                                        >
                                            {group.name}
                                            {isPrimary && <span className="ml-1.5">★</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bodyweight Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#1c1c1e] border border-white/10">
                            <div>
                                <p className="text-sm font-medium text-white">Poids du corps</p>
                                <p className="text-xs text-gray-500 mt-0.5">Sans matériel</p>
                            </div>
                            <button
                                onClick={() => setIsBodyweight(!isBodyweight)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${isBodyweight ? 'bg-[#94fbdd]' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isBodyweight ? 'translate-x-5' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => navigate('/my-exercises')}
                                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!name.trim() || muscleGroupIds.length === 0 || updateMutation.isPending}
                                className="flex-1 px-4 py-3 rounded-lg bg-[#94fbdd] text-[#09090b] font-semibold hover:bg-[#7de0c4] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditExercisePage;
