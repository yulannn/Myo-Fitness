// ─────────────────────────────────────────────────────────────
// SessionHistory – Client session list with status badges
// ─────────────────────────────────────────────────────────────

import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const STATUS_MAP = {
  COMPLETED: { label: 'Complété', icon: CheckCircleIcon, class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CANCELLED: { label: 'Annulé', icon: XCircleIcon, class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  IN_PROGRESS: { label: 'En cours', icon: ClockIcon, class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  SCHEDULED: { label: 'Planifié', icon: CalendarDaysIcon, class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

export default function SessionHistory({ sessions = [], onSessionClick }) {
  const getStatus = (session) => {
    if (session.completed) return STATUS_MAP.COMPLETED;
    if (session.status === 'CANCELLED') return STATUS_MAP.CANCELLED;
    if (session.status === 'IN_PROGRESS') return STATUS_MAP.IN_PROGRESS;
    return STATUS_MAP.SCHEDULED;
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border-subtle bg-background/30">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Historique des séances
        </h3>
      </div>

      {sessions.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-text-secondary text-sm">Aucune séance enregistrée</p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle/50">
          {sessions.map((session) => {
            const status = getStatus(session);
            const StatusIcon = status.icon;

            return (
              <div
                key={session.id}
                onClick={() => onSessionClick?.(session.id)}
                className="px-6 py-4 hover:bg-primary/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg border ${status.class}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                        {session.sessionName || 'Séance sans nom'}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {session.performedAt
                          ? new Date(session.performedAt).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                          : session.date
                            ? new Date(session.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })
                            : 'Date inconnue'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Summary badges */}
                    {session.summary && (
                      <div className="hidden sm:flex items-center gap-3 text-[10px] text-text-secondary">
                        <span>{session.summary.totalVolume?.toLocaleString()} kg</span>
                        <span className="text-white/10">|</span>
                        <span>{session.summary.totalSets} sets</span>
                        <span className="text-white/10">|</span>
                        <span>{session.summary.duration || session.duration || '—'} min</span>
                        {session.summary.avgRPE && (
                          <>
                            <span className="text-white/10">|</span>
                            <span>RPE {session.summary.avgRPE.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Status badge */}
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border whitespace-nowrap ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Mobile summary */}
                {session.summary && (
                  <div className="sm:hidden mt-2 flex items-center gap-3 text-[10px] text-text-secondary">
                    <span>{session.summary.totalVolume?.toLocaleString()} kg</span>
                    <span>•</span>
                    <span>{session.summary.totalSets} sets</span>
                    <span>•</span>
                    <span>{session.summary.duration || session.duration || '—'} min</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
