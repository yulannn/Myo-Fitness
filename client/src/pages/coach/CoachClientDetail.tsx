import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  CalendarDaysIcon,
  ClipboardDocumentIcon,
  MapPinIcon,
  AdjustmentsVerticalIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { useClientDetail, useClientSessions } from '../../api/hooks/coaching/useClientDetail';
import SessionDetailModal from '../../components/coach/SessionDetailModal';

export default function CoachClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState<'history' | 'program'>('history');
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const { data: client, isLoading: loadingDetail } = useClientDetail(clientId);
  const { data: sessions = [], isLoading: loadingSessions } = useClientSessions(clientId);

  if (loadingDetail) {
    return (
      <div className="flex flex-col min-h-screen bg-[#121214] items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#94fbdd]/20 border-t-[#94fbdd] rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col min-h-screen bg-[#121214] items-center justify-center p-6 text-center">
        <h1 className="text-white font-black text-2xl mb-4">Oups !</h1>
        <p className="text-gray-500 mb-8">Nous n'avons pas pu trouver ce client.</p>
        <button onClick={() => navigate(-1)} className="text-[#94fbdd] font-bold uppercase tracking-widest text-xs">Retour</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#121214] pb-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-24 bg-gradient-to-b from-[#94fbdd]/10 to-transparent relative overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-6 p-2 rounded-xl bg-[#252527] text-white z-10"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mt-8 space-y-4">
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-[#94fbdd]/20 p-1 flex items-center justify-center overflow-hidden shadow-2xl">
            {client.profilePictureUrl ? (
              <img src={client.profilePictureUrl} alt={client.name} className="w-full h-full object-cover rounded-[28px]" />
            ) : (
              <span className="text-white font-black text-4xl">{client.name[0]}</span>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">{client.name}</h1>
            <p className="text-[#94fbdd] text-[10px] font-black uppercase tracking-[0.2em] mt-1">{client.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-10 px-4">
          <div className="bg-[#252527]/50 backdrop-blur-xl border border-white/5 p-3 rounded-2xl text-center">
            <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Poids</p>
            <p className="text-sm font-black text-white">{client.fitnessProfiles?.weight || '-'} kg</p>
          </div>
          <div className="bg-[#252527]/50 backdrop-blur-xl border border-white/5 p-3 rounded-2xl text-center">
            <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Fréquence</p>
            <p className="text-sm font-black text-white">{client.fitnessProfiles?.trainingFrequency || '-'} / sem</p>
          </div>
          <div className="bg-[#252527]/50 backdrop-blur-xl border border-white/5 p-3 rounded-2xl text-center">
            <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Exp.</p>
            <p className="text-sm font-black text-[#94fbdd]">{client.fitnessProfiles?.experienceLevel?.slice(0, 3) || '-'}</p>
          </div>
        </div>
      </header>

      {/* ── Content Tabs ───────────────────────────────────── */}
      <div className="flex-1 px-6 -mt-12 relative z-10">
        <div className="bg-[#121214] rounded-t-[40px] pt-8 min-h-screen">
          <div className="flex p-1 bg-[#252527] rounded-2xl border border-white/5 mb-8">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-[#94fbdd] text-[#121214] shadow-lg shadow-[#94fbdd]/10' : 'text-gray-500'}`}
            >
              Historique
            </button>
            <button
              onClick={() => setActiveTab('program')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'program' ? 'bg-[#94fbdd] text-[#121214] shadow-lg shadow-[#94fbdd]/10' : 'text-gray-500'}`}
            >
              Programme
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {loadingSessions ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-[#252527] rounded-3xl animate-pulse" />
                  ))
                ) : sessions.length > 0 ? (
                  sessions.map((session: any) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className="w-full bg-[#252527] border border-white/5 p-5 rounded-3xl flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#94fbdd]/10 flex items-center justify-center">
                          <CheckBadgeIcon className={`w-6 h-6 ${session.completed ? 'text-[#94fbdd]' : 'text-gray-700'}`} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-white font-bold">{session.sessionName}</h4>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {session.performedAt ? new Date(session.performedAt).toLocaleDateString() : 'Non effectuée'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#94fbdd] font-black text-sm">{session.duration || '-'} min</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">{session.summary?.totalVolume ? `${(session.summary.totalVolume / 1000).toFixed(1)}t total` : '-'}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-20 bg-[#252527]/30 rounded-3xl border border-dashed border-white/5">
                    <CalendarDaysIcon className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">Aucune séance passée</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="program"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {client.fitnessProfiles?.trainingPrograms?.filter((p: any) => p.status === 'ACTIVE').map((prog: any) => (
                  <div key={prog.id} className="bg-[#252527] rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                          <ClipboardDocumentIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-white font-black">{prog.name}</h3>
                      </div>
                      <span className="bg-[#94fbdd]/10 text-[#94fbdd] text-[10px] font-black uppercase px-2.5 py-1 rounded-full">Actif</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-400">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">Started on {new Date(prog.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400">
                        <AdjustmentsVerticalIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">Focus: {client.fitnessProfiles?.goals?.join(', ') || 'Global'}</span>
                      </div>
                    </div>

                    <button className="w-full mt-6 py-3 rounded-2xl bg-white/5 text-white font-bold text-xs uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">
                      Voir tous les exercices
                    </button>
                  </div>
                ))}

                {client.fitnessProfiles?.trainingPrograms?.filter((p: any) => p.status === 'ACTIVE').length === 0 && (
                  <div className="text-center py-20 bg-[#252527]/30 rounded-3xl border border-dashed border-white/5">
                    <ClipboardDocumentIcon className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">Aucun programme actif</p>
                    <button className="mt-4 text-[#94fbdd] text-xs font-black uppercase tracking-widest">Assigner un programme</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        clientId={clientId}
        sessionId={selectedSessionId || 0}
      />
    </div>
  );
}
