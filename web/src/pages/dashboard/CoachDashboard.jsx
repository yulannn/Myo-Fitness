// ─────────────────────────────────────────────────────────────
// Dashboard – Coach (COACH role) ✦ Premium SaaS Design
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from './DashboardLayout.jsx';
import coachingApi from '../../api/coachingApi.js';
import StatsGrid, { StatsGridSkeleton } from '../../components/coach/StatsGrid.jsx';
import ClientsTable, { ClientsTableSkeleton } from '../../components/coach/ClientsTable.jsx';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ChartBarSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import AddClientModal from '../../components/coach/AddClientModal.jsx';

export default function CoachDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      try {
        const data = await coachingApi.getClients();
        setClients(data);
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const handleTerminate = async (relationshipId) => {
    if (!window.confirm('Voulez-vous vraiment arrêter le suivi de ce client ?')) return;
    try {
      await coachingApi.terminateRelationship(relationshipId);
      setClients((prev) => prev.filter((c) => c.relationshipId !== relationshipId));
    } catch (err) {
      console.error('Failed to terminate coaching:', err);
      alert('Erreur lors de la suppression de la relation.');
    }
  };

  // ── Computed stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    const activePrograms = clients.filter((c) => c.activeProgram).length;
    const totalSessions30d = clients.reduce((sum, c) => sum + (c.sessionsLast30Days || 0), 0);
    const ratesWithData = clients.filter((c) => c.completionRate !== null);
    const avgCompletion =
      ratesWithData.length > 0
        ? Math.round(ratesWithData.reduce((sum, c) => sum + c.completionRate, 0) / ratesWithData.length)
        : null;

    return [
      {
        label: 'Pratiquants',
        value: clients.length || '—',
        subtitle: `${clients.filter((c) => c.daysSinceLastSession !== null && c.daysSinceLastSession <= 7).length} actifs cette semaine`,
        icon: UserGroupIcon,
        color: 'from-primary/20 to-primary/5',
      },
      {
        label: 'Programmes actifs',
        value: activePrograms || '—',
        icon: ClipboardDocumentListIcon,
        color: 'from-violet-500/20 to-violet-500/5',
      },
      {
        label: 'Séances (30j)',
        value: totalSessions30d || '—',
        subtitle: `${(totalSessions30d / Math.max(clients.length, 1)).toFixed(1)} / client`,
        icon: AcademicCapIcon,
        color: 'from-blue-500/20 to-blue-500/5',
      },
      {
        label: 'Taux complétion',
        value: avgCompletion !== null ? `${avgCompletion}%` : '—',
        icon: ChartBarSquareIcon,
        color: 'from-emerald-500/20 to-emerald-500/5',
      },
    ];
  }, [clients]);

  return (
    <DashboardLayout>
      {/* ── Welcome ──────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider rounded-lg border border-primary/20">
              Coach Pro
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Bienvenue, <span className="text-primary tracking-tight">{user?.name}</span> 🏋️
          </h1>
          <p className="text-text-secondary mt-2 text-sm max-w-lg leading-relaxed">
            Optimisez le suivi de vos athlètes, analysez leurs performances et gérez vos programmes depuis votre terminal coach.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-primary text-background font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/10 whitespace-nowrap"
        >
          <PlusIcon className="w-5 h-5" />
          Nouveau Client
        </button>
      </div>

      {/* ── Invite Modal ─────────────────────────────────────── */}
      <AddClientModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* ── Stats ─────────────────────────────────────────────── */}
      {loading ? <StatsGridSkeleton /> : <StatsGrid stats={stats} />}

      {/* ── Clients section ───────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserGroupIcon className="w-6 h-6 text-primary" />
          Mes Clients
        </h2>
        <span className="text-xs text-text-secondary bg-surface border border-border-subtle px-3 py-1 rounded-full">
          {clients.length} actif{clients.length > 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <ClientsTableSkeleton />
      ) : (
        <ClientsTable clients={clients} onTerminate={handleTerminate} />
      )}
    </DashboardLayout>
  );
}
