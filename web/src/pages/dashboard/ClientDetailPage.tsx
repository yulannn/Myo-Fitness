import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useClientDetail } from '../../api/hooks/useCoaching';
import VolumeChart from '../../components/coach/VolumeChart';
import SessionHistory from '../../components/coach/SessionHistory';
import SessionDetailModal from '../../components/coach/SessionDetailModal';
import CoachProgramManager from '../../components/coach/CoachProgramManager';
import ModificationHistory from '../../components/coach/ModificationHistory';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ScaleIcon,
  ArrowsUpDownIcon,
  FireIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  const { data: client, isLoading: loading, isError } = useClientDetail(clientId ? parseInt(clientId) : null);

  useEffect(() => {
    if (isError) {
      navigate('/dashboard/coach', { replace: true });
    }
  }, [isError, navigate]);

  const allSessions = useMemo(() => {
    return client?.sessions || [];
  }, [client]);

  const profile = client?.fitnessProfiles;
  const activeProgram = profile?.trainingPrograms?.find((p: any) => p.status === 'ACTIVE');

  const expLabels: Record<string, string> = {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-white/5 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-surface border border-border-subtle rounded-2xl" />
            ))}
          </div>
          <div className="h-80 bg-surface border border-border-subtle rounded-2xl" />
          <div className="h-64 bg-surface border border-border-subtle rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!client) return null;

  return (
    <DashboardLayout>
      {/* ── Breadcrumb / Back ─────────────────────────────────── */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/coach')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm mb-4 group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour au tableau de bord
        </button>

        <div className="flex items-center gap-4">
          {client.profilePictureUrl ? (
            <img
              src={client.profilePictureUrl}
              alt={client.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-primary font-bold text-xl">
                {client.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <p className="text-sm text-text-secondary">{client.email}</p>
          </div>
        </div>
      </div>

      {/* ── Profile stats ─────────────────────────────────────── */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { icon: UserIcon, label: 'Âge', value: profile.age ? `${profile.age} ans` : '—' },
            { icon: ArrowsUpDownIcon, label: 'Taille', value: profile.height ? `${profile.height} cm` : '—' },
            { icon: ScaleIcon, label: 'Poids', value: profile.weight ? `${profile.weight} kg` : '—' },
            { icon: AcademicCapIcon, label: 'Niveau', value: profile.experienceLevel ? expLabels[profile.experienceLevel] || '—' : '—' },
            { icon: CalendarDaysIcon, label: 'Fréquence', value: profile.trainingFrequency ? `${profile.trainingFrequency}×/sem` : '—' },
            { icon: FireIcon, label: 'Objectifs', value: profile.goals?.length || 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface border border-border-subtle rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-3.5 h-3.5 text-primary/50" />
                <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">{stat.label}</p>
              </div>
              <p className="text-sm font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Goals ─────────────────────────────────────────────── */}
      {profile?.goals?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs text-text-secondary uppercase tracking-wider font-bold mb-3">Objectifs</h3>
          <div className="flex flex-wrap gap-2">
            {profile.goals.map((g: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10">
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Active Programme & History ────────────────────────── */}
      {activeProgram && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          <div className="xl:col-span-2">
            <CoachProgramManager clientId={parseInt(clientId!)} program={activeProgram} />
          </div>
          <div className="xl:col-span-1">
            <ModificationHistory programId={activeProgram.id} />
          </div>
        </div>
      )}

      {/* ── Volume Chart ──────────────────────────────────────── */}
      <div className="mb-8">
        <VolumeChart sessions={allSessions} />
      </div>

      {/* ── Session History ───────────────────────────────────── */}
      <div className="mb-8">
        <SessionHistory
          sessions={allSessions}
          onSessionClick={(sessionId: number) => setSelectedSession(sessionId)}
        />
      </div>

      {/* ── Session Detail Modal ──────────────────────────────── */}
      {selectedSession && clientId && (
        <SessionDetailModal
          clientId={parseInt(clientId)}
          sessionId={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </DashboardLayout>
  );
}
