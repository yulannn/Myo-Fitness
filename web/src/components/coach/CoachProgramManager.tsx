import React, { useState } from 'react';
import {
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    Bars3Icon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    MagnifyingGlassIcon,
    ClockIcon,
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getExImage = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/assets/exercises_illustration/${path}`;
};

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
            queryClient.invalidateQueries({ queryKey: ['program-modifications', program.id] });
            setEditingExercise(null);
            toast.success('Exercice mis à jour');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (templateId: number) =>
            apiClient.delete(`/coaching/clients/${clientId}/program/exercises/${templateId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients', clientId] });
            queryClient.invalidateQueries({ queryKey: ['program-modifications', program.id] });
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
            queryClient.invalidateQueries({ queryKey: ['program-modifications', program.id] });
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
                const resp = await apiClient.get<Exercise[]>(`/exercice/minimal?search=${query}`);
                setExercises(Array.isArray(resp.data) ? resp.data : []);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <SparklesIcon className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Master Configuration</span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Design du Programme
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-md border border-primary/20">EDITION MODE</span>
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-surface border border-border-subtle rounded-2xl px-5 py-3 flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-[9px] text-text-secondary uppercase font-bold tracking-widest mb-0.5">Séances</p>
                            <p className="text-xl font-black text-white leading-none">{program.sessionTemplates.length}</p>
                        </div>
                        <div className="w-px h-8 bg-border-subtle" />
                        <div className="text-center">
                            <p className="text-[9px] text-text-secondary uppercase font-bold tracking-widest mb-0.5">Total Exos</p>
                            <p className="text-xl font-black text-white leading-none">
                                {program.sessionTemplates.reduce((acc, curr) => acc + curr.exercises.length, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {program.sessionTemplates.map((session) => (
                    <div key={session.id} className="glass-card rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <h3 className="font-black text-white text-xl uppercase tracking-tighter italic">
                                    {session.name}
                                </h3>
                                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">
                                    {session.exercises.length} Exercises Planning
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddingExercise(session.id)}
                                className="w-12 h-12 rounded-2xl bg-primary text-[#121214] flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <PlusIcon className="w-6 h-6 stroke-[3]" />
                            </button>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {session.exercises.length === 0 ? (
                                <div className="py-12 border-2 border-dashed border-white/5 rounded-[2rem] text-center">
                                    <p className="text-sm text-text-secondary font-bold">Aucun exercice</p>
                                    <button
                                        onClick={() => setIsAddingExercise(session.id)}
                                        className="text-xs text-primary font-black uppercase mt-2 hover:underline"
                                    >
                                        + Ajouter le premier
                                    </button>
                                </div>
                            ) : (
                                session.exercises.map((ex) => (
                                    <div
                                        key={ex.id}
                                        className="relative bg-white/5 border border-white/5 rounded-[1.75rem] p-4 hover:bg-white/[0.08] hover:border-primary/20 transition-all group/ex"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-16 h-16 rounded-2xl bg-surface border border-white/5 overflow-hidden flex-shrink-0 group-hover/ex:border-primary/30 transition-colors shadow-inner">
                                                    {getExImage(ex.exercise.imageUrl) ? (
                                                        <img src={getExImage(ex.exercise.imageUrl)!} className="w-full h-full object-cover" alt={ex.exercise.name} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-white/5 uppercase font-bold text-xs text-text-secondary">
                                                            {ex.exercise.name[0]}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <p className="text-base font-black text-white leading-tight truncate">{ex.exercise.name}</p>
                                                        {ex.exercise.type === 'CARDIO' && (
                                                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[8px] font-black uppercase rounded-full border border-rose-500/20">Cardio</span>
                                                        )}
                                                    </div>

                                                    {editingExercise === ex.id ? (
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            {ex.exercise.type === 'CARDIO' ? (
                                                                <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 border border-border-subtle">
                                                                    <input
                                                                        type="number"
                                                                        className="w-14 bg-transparent text-sm font-black text-white text-center outline-none"
                                                                        value={editData.duration || 0}
                                                                        onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) })}
                                                                    />
                                                                    <span className="text-[10px] font-black text-text-secondary uppercase">min</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 border border-border-subtle">
                                                                        <input
                                                                            type="number"
                                                                            className="w-10 bg-transparent text-sm font-black text-white text-center outline-none"
                                                                            value={editData.sets}
                                                                            onChange={(e) => setEditData({ ...editData, sets: parseInt(e.target.value) })}
                                                                        />
                                                                        <span className="text-[10px] font-black text-text-secondary uppercase">Sets</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 border border-border-subtle">
                                                                        <input
                                                                            type="number"
                                                                            className="w-10 bg-transparent text-sm font-black text-white text-center outline-none"
                                                                            value={editData.reps}
                                                                            onChange={(e) => setEditData({ ...editData, reps: parseInt(e.target.value) })}
                                                                        />
                                                                        <span className="text-[10px] font-black text-text-secondary uppercase">Reps</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 border border-border-subtle">
                                                                        <input
                                                                            type="number"
                                                                            className="w-14 bg-transparent text-sm font-black text-primary text-center outline-none"
                                                                            value={editData.weight || 0}
                                                                            onChange={(e) => setEditData({ ...editData, weight: parseFloat(e.target.value) })}
                                                                        />
                                                                        <span className="text-[10px] font-black text-text-secondary uppercase">kg</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            {ex.exercise.type === 'CARDIO' ? (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                                                    <ClockIcon className="w-3 h-3 text-text-secondary" />
                                                                    <span className="text-xs font-black text-white">{ex.duration || 0}m</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-xs font-black">
                                                                        <span className="text-primary">{ex.sets}</span>
                                                                        <span className="text-text-secondary opacity-40">x</span>
                                                                        <span className="text-white">{ex.reps}</span>
                                                                    </div>
                                                                    {ex.weight !== null && ex.weight > 0 && (
                                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-black text-primary">
                                                                            <ArrowTrendingUpIcon className="w-3 h-3" />
                                                                            {ex.weight}kg
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover/ex:opacity-100 transition-opacity">
                                                {editingExercise === ex.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => updateMutation.mutate({ templateId: ex.id, ...editData })}
                                                            className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                                                            disabled={updateMutation.isPending}
                                                        >
                                                            <CheckIcon className="w-5 h-5 stroke-[2.5]" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingExercise(null)}
                                                            className="w-10 h-10 rounded-xl bg-white/5 text-text-secondary border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEditing(ex)}
                                                            className="w-10 h-10 rounded-xl bg-white/5 text-text-secondary border border-white/10 flex items-center justify-center hover:bg-primary hover:text-[#121214] hover:border-primary transition-all shadow-lg hover:shadow-primary/20"
                                                        >
                                                            <PencilSquareIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Supprimer cet exercice ?')) deleteMutation.mutate(ex.id);
                                                            }}
                                                            className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                                                            disabled={deleteMutation.isPending}
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Exercise Modal-like UI */}
                        {isAddingExercise === session.id && (
                            <div className="absolute inset-x-8 bottom-8 top-[100px] z-[20] bg-surface rounded-[2rem] border border-primary/20 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                                <div className="p-6 border-b border-border-subtle bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                            <input
                                                type="text"
                                                autoFocus
                                                className="w-full bg-surface-card border border-border-subtle rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-all font-bold placeholder:text-gray-600"
                                                placeholder="Rechercher un exercice..."
                                                value={searchQuery}
                                                onChange={(e) => handleSearch(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsAddingExercise(null);
                                                setSearchQuery('');
                                                setExercises([]);
                                            }}
                                            className="p-3 bg-white/5 rounded-xl text-text-secondary hover:text-white transition-colors"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    <div className="grid grid-cols-1 gap-2">
                                        {exercises.length > 0 ? (
                                            exercises.map((ex) => (
                                                <button
                                                    key={ex.id}
                                                    onClick={() => addMutation.mutate({ sessionTemplateId: session.id, exercise: ex })}
                                                    className="w-full text-left p-3 hover:bg-primary/10 rounded-2xl transition-all flex items-center gap-4 group/search"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-surface-card flex-shrink-0 overflow-hidden border border-white/5 group-hover/search:border-primary/30">
                                                        {getExImage(ex.imageUrl) ? (
                                                            <img src={getExImage(ex.imageUrl)!} className="w-full h-full object-cover" alt={ex.name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-black text-text-secondary">
                                                                {ex.name[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-white truncate">{ex.name}</p>
                                                        {ex.type && <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest">{ex.type}</p>}
                                                    </div>
                                                    <PlusIcon className="w-5 h-5 text-primary opacity-0 group-hover/search:opacity-100 group-hover/search:translate-x-0 -translate-x-2 transition-all" />
                                                </button>
                                            ))
                                        ) : searchQuery.length > 2 ? (
                                            <div className="py-20 text-center">
                                                <p className="text-sm text-text-secondary font-bold italic">Aucun résultat pour "{searchQuery}"</p>
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center px-10">
                                                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-2">Conseil</p>
                                                <p className="text-xs text-text-secondary/60">Tapez le nom d'un exercice pour commencer la recherche dans la base de données.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 bg-primary/5 text-center">
                                    <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Database Lookup Active</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

