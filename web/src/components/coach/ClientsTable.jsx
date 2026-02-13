// ─────────────────────────────────────────────────────────────
// ClientsTable – Sortable, searchable, filterable client list
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const SORT_OPTIONS = [
  { key: 'name', label: 'Nom' },
  { key: 'sessionsLast30Days', label: 'Séances (30j)' },
  { key: 'completionRate', label: 'Complétion' },
  { key: 'daysSinceLastSession', label: 'Dernière activité' },
];

export default function ClientsTable({ clients = [], onTerminate }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [filterInactive, setFilterInactive] = useState(false);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let list = [...clients];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.activeProgram?.name?.toLowerCase().includes(q),
      );
    }

    // Inactive filter (>7 days)
    if (filterInactive) {
      list = list.filter((c) => c.daysSinceLastSession === null || c.daysSinceLastSession > 7);
    }

    // Sort
    list.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (av === null || av === undefined) av = sortDir === 'asc' ? Infinity : -Infinity;
      if (bv === null || bv === undefined) bv = sortDir === 'asc' ? Infinity : -Infinity;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return list;
  }, [clients, search, sortKey, sortDir, filterInactive]);

  const getActivityBadge = (days) => {
    if (days === null) return { text: 'Jamais', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    if (days <= 2) return { text: 'Actif', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (days <= 7) return { text: `${days}j`, class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    return { text: `${days}j`, class: 'bg-red-500/10 text-red-400 border-red-500/20' };
  };

  return (
    <div>
      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client…"
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-white text-sm placeholder:text-text-secondary/50 focus:border-primary/40 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setFilterInactive((f) => !f)}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${filterInactive
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-surface border-border-subtle text-text-secondary hover:border-primary/30'
            }`}
        >
          <FunnelIcon className="w-4 h-4" />
          Inactifs {'>'} 7j
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border-subtle bg-background/50 text-[10px] uppercase tracking-widest font-bold text-text-secondary">
          <div className="col-span-3 flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('name')}>
            Client
            <ChevronUpDownIcon className="w-3 h-3" />
          </div>
          <div className="col-span-2">Programme</div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('sessionsLast30Days')}>
            Séances 30j
            <ChevronUpDownIcon className="w-3 h-3" />
          </div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('completionRate')}>
            Complétion
            <ChevronUpDownIcon className="w-3 h-3" />
          </div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('daysSinceLastSession')}>
            Activité
            <ChevronUpDownIcon className="w-3 h-3" />
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-text-secondary text-sm">Aucun client trouvé</p>
          </div>
        ) : (
          filtered.map((client) => {
            const badge = getActivityBadge(client.daysSinceLastSession);
            return (
              <div
                key={client.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-border-subtle/50 hover:bg-primary/[0.02] transition-colors group cursor-pointer"
                onClick={() => navigate(`/dashboard/coach/client/${client.id}`)}
              >
                {/* Client info */}
                <div className="col-span-3 flex items-center gap-3">
                  {client.profilePictureUrl ? (
                    <img
                      src={client.profilePictureUrl}
                      alt={client.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-primary font-bold text-sm">
                        {client.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{client.name}</p>
                    <p className="text-[11px] text-text-secondary truncate">{client.email}</p>
                  </div>
                </div>

                {/* Program */}
                <div className="col-span-2 flex items-center">
                  {client.activeProgram ? (
                    <span className="text-xs text-white font-medium truncate px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                      {client.activeProgram.name}
                    </span>
                  ) : (
                    <span className="text-xs text-text-secondary/50 italic">Aucun</span>
                  )}
                </div>

                {/* Sessions 30d */}
                <div className="col-span-2 flex items-center">
                  <div className="flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-primary/40" />
                    <span className="text-sm font-bold text-white">{client.sessionsLast30Days}</span>
                    <span className="text-[10px] text-text-secondary">séances</span>
                  </div>
                </div>

                {/* Completion */}
                <div className="col-span-2 flex items-center gap-2">
                  {client.completionRate !== null ? (
                    <>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[80px]">
                        <div
                          className={`h-full rounded-full transition-all ${client.completionRate >= 75
                              ? 'bg-emerald-400'
                              : client.completionRate >= 50
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                            }`}
                          style={{ width: `${client.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white">{client.completionRate}%</span>
                    </>
                  ) : (
                    <span className="text-xs text-text-secondary/50">—</span>
                  )}
                </div>

                {/* Activity */}
                <div className="col-span-2 flex items-center">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${badge.class}`}>
                    {badge.text}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTerminate?.(client.relationshipId);
                    }}
                    className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Arrêter le suivi"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────
export function ClientsTableSkeleton() {
  return (
    <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
      <div className="px-6 py-3 border-b border-border-subtle bg-background/50">
        <div className="h-3 bg-white/5 rounded w-1/3 animate-pulse" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-6 py-4 border-b border-border-subtle/50 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/5 rounded w-1/4" />
            <div className="h-2 bg-white/5 rounded w-1/6" />
          </div>
          <div className="h-3 bg-white/5 rounded w-16" />
          <div className="h-3 bg-white/5 rounded w-12" />
          <div className="h-3 bg-white/5 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
