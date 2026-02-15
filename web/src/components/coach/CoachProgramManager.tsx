import React, { useState } from 'react';
import {
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    Bars3Icon,
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/apiClient';

interface Exercise {
    id: number;
    name: string;
    imageUrl?: string;
    type?: string;
}

interface ExerciseTemplate {
    id: number;
    sets: number;
    reps: number;
    weight: number | null;
    duration: number | null;
    orderInSession: number;
    exercise: Exercise;
}

interface SessionTemplate {
    id: number;
    name: string;
    description: string | null;
    orderInProgram: number;
    exercises: ExerciseTemplate[];
}

interface Program {
    id: number;
    name: string;
    sessionTemplates: SessionTemplate[];
}

interface Props {
    clientId: number;
    program: Program;
}

export default function CoachProgramManager({ clientId, program }: Props) {
    const queryClient = useQueryClient();
    const [editingExercise, setEditingExercise] = useState<number | null>(null);
    const [editData, setEditData] = useState<{ sets: number; reps: number; weight: number | null, duration: number | null }>({
        sets: 0,
        reps: 0,
        weight: null,
        duration: null,
    });

    const [isAddingExercise, setIsAddingExercise] = useState<number | null>(null); // sessionId
    const [searchQuery, setSearchQuery] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);

    // Mutations
    const updateMutation = useMutation({
        mutationFn: (data: { templateId: number; sets: number; reps: number; weight: number | null, duration: number | null }) =>
            apiClient.patch(`/coaching/clients/${clientId}/program/exercises/${data.templateId}`, {
                sets: data.sets,
                reps: data.reps,
                weight: data.weight,
                duration: data.duration,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients', clientId] });
            setEditingExercise(null);
            toast.success('Exercice mis à jour');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (templateId: number) =>
            apiClient.delete(`/coaching/clients/${clientId}/program/exercises/${templateId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients', clientId] });
            toast.success('Exercice supprimé');
        },
    });

    const addMutation = useMutation({
        mutationFn: (data: { sessionTemplateId: number; exercise: Exercise }) =>
            apiClient.post(`/coaching/clients/${clientId}/program/sessions/${data.sessionTemplateId}/exercises`, {
                exerciseId: data.exercise.id,
                sets: data.exercise.type === 'CARDIO' ? 1 : 3,
                reps: data.exercise.type === 'CARDIO' ? 1 : 10,
                weight: 0,
                duration: data.exercise.type === 'CARDIO' ? 15 : null,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients', clientId] });
            setIsAddingExercise(null);
            setSearchQuery('');
            setExercises([]);
            toast.success('Exercice ajouté');
        },
    });

    const startEditing = (ex: ExerciseTemplate) => {
        setEditingExercise(ex.id);
        setEditData({ sets: ex.sets, reps: ex.reps, weight: ex.weight, duration: ex.duration });
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length > 2) {
            try {
                const resp = await apiClient.get<Exercise[]>(`/exercice?search=${query}`);
                setExercises(Array.isArray(resp.data) ? resp.data : []);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bars3Icon className="w-5 h-5 text-primary" />
                    Configuration du Programme
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {program.sessionTemplates.map((session) => (
                    <div key={session.id} className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                            <h3 className="font-bold text-white uppercase tracking-wider text-sm">{session.name}</h3>
                            <button
                                onClick={() => setIsAddingExercise(session.id)}
                                className="p-1.5 hover:bg-primary/10 text-primary transition-colors rounded-lg border border-primary/20"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {session.exercises.map((ex) => (
                                <div
                                    key={ex.id}
                                    className="group relative bg-white/5 border border-white/5 rounded-xl p-3 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {ex.exercise.imageUrl ? (
                                                <img src={ex.exercise.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt={ex.exercise.name} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-white/10" />
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-white">{ex.exercise.name}</p>
                                                {editingExercise === ex.id ? (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {ex.exercise.type === 'CARDIO' ? (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    className="w-16 bg-surface border border-border-subtle rounded-lg px-2 py-1 text-xs text-white"
                                                                    value={editData.duration || 0}
                                                                    onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) })}
                                                                />
                                                                <span className="text-[10px] text-text-secondary">min</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    className="w-12 bg-surface border border-border-subtle rounded-lg px-2 py-1 text-xs text-white"
                                                                    value={editData.sets}
                                                                    onChange={(e) => setEditData({ ...editData, sets: parseInt(e.target.value) })}
                                                                />
                                                                <span className="text-[10px] text-text-secondary">x</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-12 bg-surface border border-border-subtle rounded-lg px-2 py-1 text-xs text-white"
                                                                    value={editData.reps}
                                                                    onChange={(e) => setEditData({ ...editData, reps: parseInt(e.target.value) })}
                                                                />
                                                                <span className="text-[10px] text-text-secondary">@</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-16 bg-surface border border-border-subtle rounded-lg px-2 py-1 text-xs text-white"
                                                                    value={editData.weight || 0}
                                                                    onChange={(e) => setEditData({ ...editData, weight: parseFloat(e.target.value) })}
                                                                />
                                                                <span className="text-[10px] text-text-secondary">kg</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-text-secondary">
                                                        {ex.exercise.type === 'CARDIO'
                                                            ? `${ex.duration || 0} minutes`
                                                            : `${ex.sets} séries × ${ex.reps} reps ${ex.weight ? `@ ${ex.weight}kg` : ''}`
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {editingExercise === ex.id ? (
                                                <>
                                                    <button
                                                        onClick={() => updateMutation.mutate({ templateId: ex.id, ...editData })}
                                                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                                                        disabled={updateMutation.isPending}
                                                    >
                                                        <CheckIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingExercise(null)}
                                                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEditing(ex)}
                                                        className="p-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Supprimer cet exercice ?')) deleteMutation.mutate(ex.id);
                                                        }}
                                                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isAddingExercise === session.id && (
                            <div className="bg-surface border border-primary/20 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-white/5 border border-border-subtle rounded-lg px-3 py-2 text-sm text-white"
                                        placeholder="Chercher un exercice..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                    <button
                                        onClick={() => {
                                            setIsAddingExercise(null);
                                            setSearchQuery('');
                                            setExercises([]);
                                        }}
                                        className="p-2 text-text-secondary hover:text-white"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                                    {exercises.map((ex) => (
                                        <button
                                            key={ex.id}
                                            onClick={() => addMutation.mutate({ sessionTemplateId: session.id, exercise: ex })}
                                            className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded bg-white/10 flex-shrink-0 overflow-hidden">
                                                {ex.imageUrl && <img src={ex.imageUrl} className="w-full h-full object-cover" alt={ex.name} />}
                                            </div>
                                            <span className="text-sm text-white">{ex.name}</span>
                                        </button>
                                    ))}
                                    {searchQuery.length > 2 && exercises.length === 0 && (
                                        <p className="text-center py-2 text-xs text-text-secondary">Aucun exercice trouvé</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
