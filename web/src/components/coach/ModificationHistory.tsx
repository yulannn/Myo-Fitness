import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowPathIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/apiClient';
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
            queryClient.invalidateQueries({ queryKey: ['clients'] }); // Invalidate client details to see the reverted state
            toast.success('Modification annulée');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Erreur lors de l'annulation");
        },
    });

    if (isLoading) return <div className="animate-pulse h-40 bg-surface rounded-2xl border border-border-subtle" />;

    return (
        <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle bg-white/5 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Historique des modifications</h3>
            </div>

            <div className="divide-y divide-border-subtle max-h-96 overflow-y-auto custom-scrollbar">
                {modifications?.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-text-secondary">Aucune modification enregistrée.</p>
                    </div>
                ) : (
                    modifications?.map((mod) => (
                        <div key={mod.id} className={`p-4 transition-colors ${mod.isReverted ? 'opacity-50 grayscale' : 'hover:bg-white/5'}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {mod.coach.profilePictureUrl ? (
                                            <img src={mod.coach.profilePictureUrl} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] text-primary font-bold">{mod.coach.name[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{mod.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-text-secondary">
                                                {new Date(mod.createdAt).toLocaleString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                            {mod.isReverted && (
                                                <span className="flex items-center gap-0.5 text-[9px] text-rose-400 font-bold uppercase tracking-tighter">
                                                    <XCircleIcon className="w-3 h-3" /> Annulée
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!mod.isReverted && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Voulez-vous vraiment annuler cette modification ?')) {
                                                revertMutation.mutate(mod.id);
                                            }
                                        }}
                                        disabled={revertMutation.isPending}
                                        className="flex-shrink-0 p-2 text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all group"
                                        title="Annuler cette modification"
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${revertMutation.isPending && revertMutation.variables === mod.id ? 'animate-spin text-primary' : ''}`} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
