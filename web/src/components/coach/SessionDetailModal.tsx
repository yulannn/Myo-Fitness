import React from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useClientSessionDetail } from '../../api/hooks/useCoaching';

interface SessionDetailModalProps {
  clientId: number;
  sessionId: number;
  onClose: () => void;
}

export default function SessionDetailModal({ clientId, sessionId, onClose }: SessionDetailModalProps) {
  const {
    data: session,
    isLoading: loading,
    error,
  } = useClientSessionDetail(clientId, sessionId);

  if (!sessionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-background/50">
          <div>
            <h3 className="text-lg font-bold text-white">
              {loading ? 'Chargement…' : session?.sessionName || 'Détail de la séance'}
            </h3>
            {session?.performedAt && (
              <p className="text-xs text-text-secondary mt-0.5">
                {new Date(session.performedAt).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                  <div className="space-y-2">
                    <div className="h-10 bg-white/5 rounded-lg" />
                    <div className="h-10 bg-white/5 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-sm">{(error as any).message || 'Une erreur est survenue'}</p>
            </div>
          ) : session ? (
            <>
              {/* Summary bar */}
              {session.summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Volume', value: `${session.summary.totalVolume?.toLocaleString()} kg` },
                    { label: 'Sets', value: session.summary.totalSets },
                    { label: 'Reps', value: session.summary.totalReps },
                    { label: 'Durée', value: `${session.summary.duration || session.duration || '—'} min` },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-background rounded-xl px-4 py-3 border border-border-subtle">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">{stat.label}</p>
                      <p className="text-lg font-bold text-white mt-0.5">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Exercises */}
              <div className="space-y-4">
                {session.exercices?.map((ex: any) => {
                  const primaryMuscle = ex.exercice.groupes?.find((g: any) => g.isPrimary)?.groupe?.name;

                  return (
                    <div key={ex.id} className="bg-background rounded-xl border border-border-subtle overflow-hidden">
                      {/* Exercise header */}
                      <div className="px-4 py-3 flex items-center justify-between border-b border-border-subtle/50">
                        <div className="flex items-center gap-3">
                          {ex.exercice.imageUrl && (
                            <img
                              src={ex.exercice.imageUrl}
                              alt={ex.exercice.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-bold text-white">{ex.exercice.name}</p>
                            {primaryMuscle && (
                              <p className="text-[10px] text-primary font-medium">{primaryMuscle}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-text-secondary">
                          {ex.sets}×{ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ''}
                        </span>
                      </div>

                      {/* Sets table */}
                      {ex.performances?.length > 0 && (
                        <div className="px-4 py-2">
                          <div className="grid grid-cols-5 gap-2 text-[9px] text-text-secondary uppercase tracking-widest font-bold py-1.5">
                            <span>Set</span>
                            <span>Reps</span>
                            <span>Charge</span>
                            <span>RPE</span>
                            <span className="text-right">Statut</span>
                          </div>
                          {ex.performances.map((perf: any) => (
                            <div
                              key={perf.set_index}
                              className="grid grid-cols-5 gap-2 py-2 border-t border-border-subtle/30 text-xs"
                            >
                              <span className="text-text-secondary font-bold">#{perf.set_index + 1}</span>
                              <span className="text-white font-medium">
                                {perf.reps_effectuees ?? '—'}
                                {perf.reps_prevues && (
                                  <span className="text-text-secondary/50 ml-0.5">/{perf.reps_prevues}</span>
                                )}
                              </span>
                              <span className="text-white font-medium">{perf.weight ? `${perf.weight}kg` : '—'}</span>
                              <span className="text-text-secondary">{perf.rpe || '—'}</span>
                              <span className="text-right">
                                {perf.success ? (
                                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 inline-block" />
                                ) : (
                                  <XCircleIcon className="w-4 h-4 text-red-400 inline-block" />
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
