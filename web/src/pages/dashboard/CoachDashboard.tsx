import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import { useClients, useTerminateRelationship } from '../../api/hooks/useCoaching';
import ClientsTable, { ClientsTableSkeleton } from '../../components/coach/ClientsTable';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import AddClientModal from '../../components/coach/AddClientModal';
import { Client } from '../../types';

export default function CoachDashboard() {
  const { user } = useAuth();
  const { data: clients = [], isLoading: loading } = useClients();
  const terminateMutation = useTerminateRelationship();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTerminate = async (relationshipId: number) => {
    if (!window.confirm('Voulez-vous vraiment arrêter le suivi de ce client ?')) return;
    try {
      await terminateMutation.mutateAsync(relationshipId);
    } catch (err) {
      console.error('Failed to terminate coaching:', err);
      alert('Erreur lors de la suppression de la relation.');
    }
  };

  // ── Search & Filter ────────────────────────────────────────
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase().trim();
    return clients.filter(
      (c: Client) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.activeProgram?.name?.toLowerCase().includes(query))
    );
  }, [clients, searchQuery]);

  return (
    <DashboardLayout>
      {/* ── Welcome Area ──────────────────────────────────────── */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Dashboard Pro</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-none">
            Salut, <span className="text-primary">{user?.name}</span>
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">
              <UserGroupIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-white">
                {clients.length} <span className="text-text-secondary font-medium">élève{clients.length > 1 ? 's' : ''}</span>
              </span>
            </div>
            <p className="text-xs text-text-secondary font-medium italic">
              {clients.filter((c: Client) => c.daysSinceLastSession !== null && c.daysSinceLastSession! <= 7).length} actifs cette semaine
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-primary text-background font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10 whitespace-nowrap group"
        >
          <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Ajouter un client
        </button>
      </div>

      {/* ── Invite Modal ─────────────────────────────────────── */}
      <AddClientModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          // Re-fetch or manually add if desired, but service usually keeps it PENDING
        }}
      />

      {/* ── Client List Area ───────────────────────────────────── */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <UserGroupIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Liste des clients</h2>
              <p className="text-[11px] text-text-secondary uppercase tracking-[0.2em] font-bold mt-1">Gestion des athlètes</p>
            </div>
          </div>

          <div className="relative group min-w-[320px]">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un athlète..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-card/40 border border-white/5 focus:border-primary/50 text-white rounded-2xl pl-11 pr-4 py-4 text-sm transition-all outline-none placeholder:text-text-secondary/30 font-semibold"
            />
          </div>
        </div>

        <div>
          {loading ? (
            <ClientsTableSkeleton />
          ) : (
            <ClientsTable
              clients={filteredClients}
              onTerminate={handleTerminate}
            />
          )}

          {!loading && filteredClients.length === 0 && searchQuery && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <MagnifyingGlassIcon className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-white font-black text-xl">Aucun résultat</h3>
              <p className="text-text-secondary text-sm mt-2 max-w-sm font-medium">
                Nous n'avons trouvé aucun client correspondant à votre recherche.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
