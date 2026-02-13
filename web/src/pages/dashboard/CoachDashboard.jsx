// ─────────────────────────────────────────────────────────────
// Dashboard – Coach (COACH role)
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from './DashboardLayout.jsx';
import coachingApi from '../../api/coachingApi.js';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';

const stats = [
  { label: 'Pratiquants', value: '—', icon: UserGroupIcon, color: 'from-primary/20 to-primary/5' },
  { label: 'Programmes actifs', value: '—', icon: ClipboardDocumentListIcon, color: 'from-violet-500/20 to-violet-500/5' },
  { label: 'Séances planifiées', value: '—', icon: AcademicCapIcon, color: 'from-blue-500/20 to-blue-500/5' },
  { label: 'Taux de complétion', value: '—', icon: ChartBarSquareIcon, color: 'from-emerald-500/20 to-emerald-500/5' },
];

export default function CoachDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Update dynamic stats
  const dynamicStats = [
    { label: 'Pratiquants', value: clients.length || '—', icon: UserGroupIcon, color: 'from-primary/20 to-primary/5' },
    { label: 'Programmes actifs', value: '—', icon: ClipboardDocumentListIcon, color: 'from-violet-500/20 to-violet-500/5' },
    { label: 'Séances planifiées', value: '—', icon: AcademicCapIcon, color: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Taux de complétion', value: '—', icon: ChartBarSquareIcon, color: 'from-emerald-500/20 to-emerald-500/5' },
  ];

  return (
    <DashboardLayout>
      {/* ── Welcome ──────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider rounded-lg border border-primary/20">
            Coach
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Bienvenue, <span className="text-primary">{user?.name}</span> 🏋️
        </h1>
        <p className="text-text-secondary mt-2 text-sm">
          Gérez vos pratiquants et suivez leur progression depuis votre espace coach.
        </p>
      </div>

      {/* ── Stats grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {dynamicStats.map((s) => (
          <div
            key={s.label}
            className={`relative overflow-hidden rounded-xl border border-border-subtle p-5 bg-gradient-to-br ${s.color} backdrop-blur-lg group hover:border-primary/20 transition-all duration-300`}
          >
            <s.icon className="w-8 h-8 text-white/20 absolute top-4 right-4 group-hover:text-white/30 transition-colors" />
            <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Mes Clients ───────────────────────────────────────── */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-surface border border-border-subtle animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-surface/50 p-12 text-center backdrop-blur-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <UserGroupIcon className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aucun client pour le moment</h3>
          <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
            Utilisez votre application mobile pour ajouter des pratiquants via leur code unique.
            Ils apparaîtront ici une fois qu'ils auront accepté votre demande.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-surface border border-border-subtle rounded-2xl p-6 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {client.profilePictureUrl ? (
                    <img
                      src={client.profilePictureUrl}
                      alt={client.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-primary font-bold text-lg">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white group-hover:text-primary transition-colors">{client.name}</h3>
                    <p className="text-xs text-text-secondary">{client.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Goals */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-2">Objectifs</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.goals.length > 0 ? client.goals.map((g, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] rounded-md border border-primary/10">
                        {g}
                      </span>
                    )) : (
                      <span className="text-[10px] text-text-secondary/50">Aucun objectif défini</span>
                    )}
                  </div>
                </div>

                {/* Last Session */}
                <div className="pt-4 border-t border-border-subtle/50">
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-1">Dernière séance</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white font-medium">
                      {client.lastSessionName || 'Aucune séance'}
                    </p>
                    {client.lastSessionDate && (
                      <p className="text-[10px] text-text-secondary">
                        {new Date(client.lastSessionDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <button className="w-full mt-2 py-2.5 bg-background border border-border-subtle hover:border-primary/50 text-white text-xs font-bold rounded-xl transition-all">
                  Visualiser le profil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
