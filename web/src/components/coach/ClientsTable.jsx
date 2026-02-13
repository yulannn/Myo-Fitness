import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronUpDownIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function ClientsTable({ clients = [], onTerminate }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    let list = [...clients];
    list.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (av === null || av === undefined) av = sortDir === 'asc' ? Infinity : -Infinity;
      if (bv === null || bv === undefined) bv = sortDir === 'asc' ? Infinity : -Infinity;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [clients, sortKey, sortDir]);

  const getActivityBadge = (days) => {
    if (days === null) return { text: 'Jamais', class: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/10' };
    if (days <= 2) return { text: 'Actif', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' };
    if (days <= 7) return { text: `${days}j`, class: 'bg-yellow-500/10 text-yellow-500/70 border-yellow-500/10' };
    return { text: `${days}j`, class: 'bg-red-500/10 text-red-400 border-red-500/10' };
  };

  return (
    <div className="w-full">
      {/* ── Table Header ────────────────────────────────────────── */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-black text-text-secondary">
        <div className="col-span-4 flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('name')}>
          Pratiquant
          <ChevronUpDownIcon className="w-3 h-3 text-text-secondary/30" />
        </div>
        <div className="col-span-3">Programme Actif</div>
        <div className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('sessionsLast30Days')}>
          Volume (30j)
          <ChevronUpDownIcon className="w-3 h-3 text-text-secondary/30" />
        </div>
        <div className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('daysSinceLastSession')}>
          Activité
          <ChevronUpDownIcon className="w-3 h-3 text-text-secondary/30" />
        </div>
        <div className="col-span-1"></div>
      </div>

      {/* ── Table Body ─────────────────────────────────────────── */}
      <div className="space-y-1 pb-4">
        {sorted.map((client) => {
          const badge = getActivityBadge(client.daysSinceLastSession);
          const initials = client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

          return (
            <div
              key={client.id}
              onClick={() => navigate(`/dashboard/coach/client/${client.id}`)}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-6 bg-transparent hover:bg-white/[0.02] transition-all duration-200 group cursor-pointer border-b border-white/[0.05] last:border-none"
            >
              {/* User Identity */}
              <div className="col-span-4 flex items-center gap-4">
                <div className="relative shrink-0">
                  {client.profilePictureUrl ? (
                    <img
                      src={client.profilePictureUrl}
                      alt={client.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/5 group-hover:ring-primary/40 transition-all duration-500 shadow-xl"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner">
                      <span className="text-primary font-black text-sm tracking-tighter">{initials}</span>
                    </div>
                  )}
                  {client.daysSinceLastSession !== null && client.daysSinceLastSession <= 2 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-surface rounded-full shadow-sm shadow-primary/40" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors tracking-tight">{client.name}</p>
                  <p className="text-[11px] text-text-secondary/60 font-medium truncate mt-0.5">{client.email}</p>
                </div>
              </div>

              {/* Active Program */}
              <div className="col-span-3 flex items-center">
                {client.activeProgram ? (
                  <div className="flex items-center gap-2 group/prog">
                    <div className="w-1 h-4 bg-violet-500/40 rounded-full" />
                    <span className="text-xs text-white/90 font-bold truncate max-w-[150px]">
                      {client.activeProgram.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-text-secondary/30 uppercase font-black tracking-widest italic">Aucun suivi</span>
                )}
              </div>

              {/* Training Volume */}
              <div className="col-span-2 flex items-center shrink-0">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-primary">
                    <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                    <span className="text-sm font-black tracking-tighter leading-none">{client.sessionsLast30Days}</span>
                  </div>
                  <span className="text-[9px] text-text-secondary/50 uppercase font-black tracking-widest mt-1">Séances / 30j</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="col-span-2 flex items-center">
                <div className={`px-4 py-1.5 text-[10px] font-black rounded-xl border transition-all ${badge.class} uppercase tracking-widest`}>
                  {badge.text}
                </div>
              </div>

              {/* Action area */}
              <div className="col-span-1 flex items-center justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTerminate?.(client.relationshipId);
                  }}
                  className="p-3 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                  title="Rompre la relation"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────
export function ClientsTableSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-6 py-6 border border-white/5 rounded-[2rem] flex items-center gap-6 animate-pulse bg-white/5">
          <div className="w-12 h-12 rounded-2xl bg-white/5" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-white/5 rounded-full w-1/3" />
            <div className="h-3 bg-white/5 rounded-full w-1/4" />
          </div>
          <div className="h-4 bg-white/5 rounded-full w-24" />
          <div className="h-8 bg-white/5 rounded-2xl w-20" />
        </div>
      ))}
    </div>
  );
}

