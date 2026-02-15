import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowPathIcon,
    ClockIcon,
    XCircleIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    Bars3Icon,
    SparklesIcon,
    FireIcon,
    ArrowTrendingUpIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import CoachingService from '../../api/services/coachingService';

interface Modification {
    id: number;
    type: string;
    description: string;
    isReverted: boolean;
    createdAt: string;
    coach: {
        name: string;
        profilePictureUrl?: string;
    };
}

interface Props {
    programId: number;
}

export default function ModificationHistory({ programId }: Props) {
    const queryClient = useQueryClient();

    const { data: modifications, isLoading } = useQuery({
        queryKey: ['program-modifications', programId],
        queryFn: () => CoachingService.getProgramModifications(programId),
    });

    const revertMutation = useMutation({
        mutationFn: (modId: number) => CoachingService.revertModification(modId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program-modifications', programId] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Modification annulée');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Erreur lors de l'annulation");
        },
    });

    const clearHistoryMutation = useMutation({
        mutationFn: () => CoachingService.clearProgramModifications(programId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program-modifications', programId] });
            toast.success('Historique vidé');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Erreur lors de la suppression de l'historique");
        },
    });

    if (isLoading) return (
        <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden animate-pulse">
            <div className="h-12 bg-white/5 border-b border-white/5 px-6 flex items-center gap-3">
                <div className="w-5 h-5 bg-white/10 rounded-full" />
                <div className="h-4 bg-white/10 rounded w-40" />
            </div>
            <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-3 bg-white/10 rounded w-3/4" />
                            <div className="h-2 bg-white/5 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-surface-card border border-border-subtle rounded-2xl flex flex-col transition-all duration-300 hover:shadow-[0_0_30px_rgba(148,251,221,0.05)] border-white/5">
            {/* Header Sticky */}
            <div className="sticky top-0 z-10 px-6 py-5 border-b border-border-subtle rounded-t-2xl bg-surface-card/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <ClockIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase tracking-widest">Activité du Programme</h3>
                        <p className="text-[10px] text-text-secondary font-medium uppercase tracking-tighter mt-0.5">Historique des modifications</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {modifications && modifications.length > 0 && (
                        <>
                            <button
                                onClick={() => {
                                    if (confirm('Voulez-vous vraiment vider tout l\'historique d\'activité ? Cette action est irréversible.')) {
                                        clearHistoryMutation.mutate();
                                    }
                                }}
                                disabled={clearHistoryMutation.isPending}
                                className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-[10px] font-bold text-rose-400 uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                            >
                                <TrashIcon className={`w-3.5 h-3.5 ${clearHistoryMutation.isPending ? 'animate-pulse' : ''}`} />
                                Vider
                            </button>
                            <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-text-secondary border border-white/5">
                                {modifications.length} ENTRIES
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* List with Max Height */}
            <div className="overflow-y-auto max-h-[520px] custom-scrollbar p-6 relative">
                {modifications?.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <ClockIcon className="w-6 h-6 text-text-secondary opacity-30" />
                        </div>
                        <p className="text-sm font-medium text-text-secondary mb-1">Aucune modification</p>
                        <p className="text-[10px] text-text-secondary/60 uppercase tracking-tighter">Votre historique apparaîtra ici</p>
                    </div>
                ) : (
                    <div className="relative space-y-6">
                        {/* Vertical Line */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-[1.5px] bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />

                        {modifications?.map((mod, index) => {
                            const isNewest = index === 0;
                            return (
                                <div
                                    key={mod.id}
                                    className={`relative pl-10 group transition-all duration-300 ${mod.isReverted ? 'opacity-40 grayscale-[0.8]' : ''}`}
                                >
                                    {/* Timeline Node */}
                                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${mod.isReverted
                                        ? 'bg-surface border-border-subtle'
                                        : isNewest
                                            ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(148,251,221,0.3)]'
                                            : 'bg-surface border-border-subtle group-hover:border-primary/50'
                                        }`}>
                                        {mod.type === 'EXERCISE_ADDED' ? (
                                            <PlusIcon className={`w-4 h-4 ${mod.isReverted ? 'text-text-secondary' : 'text-primary'}`} />
                                        ) : mod.type === 'EXERCISE_REMOVED' ? (
                                            <XCircleIcon className={`w-4 h-4 ${mod.isReverted ? 'text-text-secondary' : 'text-rose-400'}`} />
                                        ) : (
                                            <PencilSquareIcon className={`w-4 h-4 ${mod.isReverted ? 'text-text-secondary' : 'text-primary'}`} />
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5 bg-white/[0.02] border border-white/5 rounded-2xl p-4 group-hover:bg-white/[0.04] transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-5 h-5 rounded-md overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                                                        {mod.coach.profilePictureUrl ? (
                                                            <img src={mod.coach.profilePictureUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-primary bg-primary/10">
                                                                {mod.coach.name[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{mod.coach.name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span className="text-[10px] font-medium text-text-secondary/60">
                                                        {new Date(mod.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} • {new Date(mod.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white font-medium leading-relaxed italic opacity-90 group-hover:opacity-100 transition-opacity">
                                                    "{mod.description}"
                                                </p>
                                            </div>

                                            {!mod.isReverted && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Voulez-vous vraiment annuler cette modification ?')) {
                                                            revertMutation.mutate(mod.id);
                                                        }
                                                    }}
                                                    disabled={revertMutation.isPending}
                                                    className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-90 group/btn"
                                                    title="Annuler"
                                                >
                                                    <ArrowPathIcon className={`w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500 ${revertMutation.isPending && revertMutation.variables === mod.id ? 'animate-spin text-primary' : ''}`} />
                                                </button>
                                            )}
                                        </div>

                                        {mod.isReverted && (
                                            <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md">
                                                <XCircleIcon className="w-3 h-3 text-rose-400" />
                                                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Action annulée</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer gradient for smooth transition */}
            <div className="h-6 bg-gradient-to-t from-surface-card to-transparent pointer-events-none rounded-b-2xl" />
        </div>
    );
}

