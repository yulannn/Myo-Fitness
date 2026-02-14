import { XMarkIcon, CalendarDaysIcon, ClockIcon, TrophyIcon, AdjustmentsVerticalIcon } from '@heroicons/react/24/outline';
import { useClientSessionDetail } from '../../api/hooks/coaching/useClientDetail';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  sessionId: number;
}

export default function SessionDetailModal({ isOpen, onClose, clientId, sessionId }: SessionDetailModalProps) {
  const { data: session, isLoading } = useClientSessionDetail(clientId, sessionId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg bg-[#1c1c1e] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] border border-white/5 shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#94fbdd]/10 flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-[#94fbdd]" />
              </div>
              <div>
                <h3 className="text-white font-black truncate max-w-[200px]">{session?.sessionName || 'Détails Séance'}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">
                  {session?.performedAt ? new Date(session.performedAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Planifiée'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-gray-400">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl" />)}
              </div>
            ) : session ? (
              <>
                {/* Summary Chips */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#252527] p-3 rounded-2xl border border-white/5 text-center">
                    <ClockIcon className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <span className="text-white font-black text-xs">{session.duration || '-'} min</span>
                  </div>
                  <div className="bg-[#252527] p-3 rounded-2xl border border-white/5 text-center">
                    <AdjustmentsVerticalIcon className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                    <span className="text-white font-black text-xs">{session.exercices?.length || 0} Exos</span>
                  </div>
                  <div className="bg-[#252527] p-3 rounded-2xl border border-white/5 text-center">
                    <TrophyIcon className="w-4 h-4 text-[#94fbdd] mx-auto mb-1" />
                    <span className="text-white font-black text-xs">{(session.summary?.totalVolume / 1000).toFixed(1) || 0}t</span>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-6">
                  {session.exercices?.map((ex: any, idx: number) => (
                    <div key={ex.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 border border-white/10">
                          {idx + 1}
                        </div>
                        <h4 className="text-white font-bold">{ex.exercice.name}</h4>
                      </div>

                      <div className="bg-[#252527] rounded-2xl overflow-hidden border border-white/5">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-white/5 text-gray-500 font-black uppercase tracking-widest">
                            <tr>
                              <th className="px-4 py-2">Set</th>
                              <th className="px-4 py-2">Prévu</th>
                              <th className="px-4 py-2">Fait</th>
                              <th className="px-4 py-2">Charge</th>
                              <th className="px-4 py-2 text-right">RPE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {ex.performances?.length > 0 ? (
                              ex.performances.map((perf: any) => (
                                <tr key={perf.set_index} className="text-white">
                                  <td className="px-4 py-3 font-bold text-gray-500">{perf.set_index}</td>
                                  <td className="px-4 py-3">{perf.reps_prevues || '-'}</td>
                                  <td className={`px-4 py-3 font-bold ${perf.success ? 'text-[#94fbdd]' : 'text-orange-400'}`}>
                                    {perf.reps_effectuees || '-'}
                                  </td>
                                  <td className="px-4 py-3 font-bold">{perf.weight || 0}kg</td>
                                  <td className="px-4 py-3 text-right">
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                      {perf.rpe || '-'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-4 py-4 text-center text-gray-600 font-medium italic">
                                  Aucune performance enregistrée
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Impossible de charger les détails de cette séance.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
