import React, { useState } from 'react';
import { PlusIcon, TrashIcon, ChevronLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { DeleteConfirmationModal } from '../../components/ui/modal/DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useMuscleGroups } from '../../api/hooks/muscle-group/useGetMuscleGroups';
import { useCreateExercice } from '../../api/hooks/exercice/useCreateExercice';
import { useExercicesMinimal } from '../../api/hooks/exercice/useGetExercicesMinimal';
import { useDeleteExercice } from '../../api/hooks/exercice/useDeleteExercice';

export const MyExercisesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: muscleGroups = [] } = useMuscleGroups();
    const createExerciseMutation = useCreateExercice();
    const { data: exercises = [] } = useExercicesMinimal();
    const deleteMutation = useDeleteExercice();

    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseMuscleGroupIds, setNewExerciseMuscleGroupIds] = useState<number[]>([]);
    const [newExerciseIsBodyweight, setNewExerciseIsBodyweight] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
    const [exerciseNameToDelete, setExerciseNameToDelete] = useState<string>('');

    // Filter only user exercises
    const myExercises = exercises.filter(ex => ex.isDefault === false);

    const handleCreateExercise = async () => {
        if (!newExerciseName.trim() || newExerciseMuscleGroupIds.length === 0) return;

        try {
            await createExerciseMutation.mutateAsync({
                name: newExerciseName.trim(),
                difficulty: 3,
                bodyWeight: newExerciseIsBodyweight,
                Materials: !newExerciseIsBodyweight,
                muscleGroupIds: newExerciseMuscleGroupIds,
            });
            resetForm();
            setIsCreating(false);
        } catch (error) {
            console.error('Failed to create exercise:', error);
        }
    };

    const resetForm = () => {
        setNewExerciseName('');
        setNewExerciseMuscleGroupIds([]);
        setNewExerciseIsBodyweight(false);
    };

    const toggleMuscleGroup = (groupId: number) => {
        setNewExerciseMuscleGroupIds(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const openDeleteModal = (id: number, name: string) => {
        setExerciseToDelete(id);
        setExerciseNameToDelete(name);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (exerciseToDelete) {
            try {
                await deleteMutation.mutateAsync(exerciseToDelete);
                setDeleteModalOpen(false);
                setExerciseToDelete(null);
                setExerciseNameToDelete('');
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#121214] min-h-screen pb-24">
            {/* Header */}
            <div className="bg-[#121214]">
                {/* Top section - Back button + Title */}
                <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => isCreating ? setIsCreating(false) : navigate('/settings')}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-medium text-white">
                            {isCreating ? 'Nouvel exercice' : 'Mes exercices'}
                        </h1>
                    </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-white/5" />

                {/* Bottom section - Count + Create button */}
                {!isCreating && (
                    <div className="max-w-4xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                {myExercises.length} exercice{myExercises.length > 1 ? 's' : ''}
                            </p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-3 py-1.5 text-sm text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-all"
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    {isCreating ? (
                        <div className="space-y-6">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">
                                    Nom de l'exercice
                                </label>
                                <input
                                    type="text"
                                    value={newExerciseName}
                                    onChange={(e) => setNewExerciseName(e.target.value)}
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
                                        const isSelected = newExerciseMuscleGroupIds.includes(group.id);
                                        const isPrimary = newExerciseMuscleGroupIds[0] === group.id;

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
                                    onClick={() => setNewExerciseIsBodyweight(!newExerciseIsBodyweight)}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${newExerciseIsBodyweight ? 'bg-[#94fbdd]' : 'bg-gray-600'
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${newExerciseIsBodyweight ? 'translate-x-5' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setIsCreating(false);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleCreateExercise}
                                    disabled={!newExerciseName.trim() || newExerciseMuscleGroupIds.length === 0 || createExerciseMutation.isPending}
                                    className="flex-1 px-4 py-3 rounded-lg bg-[#94fbdd] text-[#09090b] font-semibold hover:bg-[#7de0c4] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {createExerciseMutation.isPending ? 'Création...' : 'Créer l\'exercice'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myExercises.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <PlusIcon className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Aucun exercice</h3>
                                    <p className="text-sm text-gray-500 mb-6 max-w-xs">
                                        Créez votre premier exercice personnalisé
                                    </p>
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="px-4 py-2 bg-[#94fbdd] text-[#09090b] font-medium rounded-lg hover:bg-[#7de0c4] transition-all"
                                    >
                                        Créer un exercice
                                    </button>
                                </div>
                            ) : (
                                myExercises.map((ex) => (
                                    <div
                                        key={ex.id}
                                        className="group flex items-center gap-4 p-4 rounded-lg bg-[#1c1c1e] border border-white/5 hover:border-white/10 transition-all"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-white mb-1 truncate">
                                                {ex.name}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {ex.groupes?.slice(0, 3).map((g, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400"
                                                    >
                                                        {g.groupe.name}
                                                        {idx === 0 && ' ★'}
                                                    </span>
                                                ))}
                                                {ex.bodyWeight && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-[#94fbdd]/10 text-[#94fbdd]">
                                                        PDC
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/my-exercises/${ex.id}`)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(ex.id, ex.name)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Supprimer l'exercice"
                description={`Êtes-vous sûr de vouloir supprimer "${exerciseNameToDelete}" ? Cette action est irréversible.`}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
};
