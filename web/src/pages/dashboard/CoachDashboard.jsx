// ─────────────────────────────────────────────────────────────
// Dashboard – Coach (COACH role)
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from './DashboardLayout.jsx';
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
        {stats.map((s) => (
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

      {/* ── Placeholder content ──────────────────────────────── */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
          <AcademicCapIcon className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Espace Coach en construction</h2>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          Bientôt vous pourrez créer des programmes, suivre vos pratiquants et analyser
          leurs performances directement depuis le web.
        </p>
      </div>
    </DashboardLayout>
  );
}
