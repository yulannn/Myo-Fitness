import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCoachClients } from '../../api/hooks/coaching/useCoachClients';
import { useNavigate } from 'react-router-dom';
import { COACH_CLIENT_DETAIL, COACH_SOCIAL } from '../../utils/paths';
import AddClientModal from '../../components/coach/AddClientModal';

export default function CoachClients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: clients = [], isLoading } = useCoachClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#121214] pb-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-8 bg-gradient-to-b from-[#94fbdd]/10 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-2"
            >
              <div className="h-1 w-6 bg-[#94fbdd] rounded-full" />
              <span className="text-[10px] font-black text-[#94fbdd] uppercase tracking-[0.2em]">Dashboard Pro</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black text-white"
            >
              Salut, <span className="text-[#94fbdd]">{user?.name?.split(' ')[0]}</span>
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-12 h-12 rounded-2xl bg-[#94fbdd]/20 border border-[#94fbdd]/30 flex items-center justify-center overflow-hidden"
          >
            {user?.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#94fbdd] font-bold">{user?.name?.[0]}</span>
            )}
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-[#252527]/50 backdrop-blur-xl border border-white/5 p-4 rounded-3xl">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Clients</p>
            <p className="text-2xl font-black text-white">{clients.length}</p>
          </div>
          <div className="bg-[#252527]/50 backdrop-blur-xl border border-white/5 p-4 rounded-3xl">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Actifs (7j)</p>
            <p className="text-2xl font-black text-[#94fbdd]">
              {clients.filter(c => c.lastSessionDate && (new Date().getTime() - new Date(c.lastSessionDate).getTime()) < 7 * 24 * 3600 * 1000).length}
            </p>
          </div>
        </div>
      </header>

      {/* ── Search Bar ─────────────────────────────────────── */}
      <div className="px-6 mb-6">
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#94fbdd] transition-colors" />
          <input
            type="text"
            placeholder="Rechercher un athlète..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#252527] border border-white/5 focus:border-[#94fbdd]/30 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 outline-none transition-all shadow-xl font-medium"
          />
        </div>
      </div>

      {/* ── Client List ────────────────────────────────────── */}
      <div className="flex-1 px-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.1em]">Tes Athlètes</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-[#121214] text-xs font-black flex items-center gap-1.5 bg-[#94fbdd] px-4 py-2 rounded-full active:scale-95 transition-all shadow-lg shadow-[#94fbdd]/10"
          >
            <PlusIcon className="w-4 h-4" />
            Inviter
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="h-24 bg-[#252527]/50 animate-pulse rounded-3xl border border-white/5" />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(COACH_CLIENT_DETAIL.replace(':id', client.id.toString()))}
                className="bg-[#252527] border border-white/5 p-4 rounded-3xl flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg relative">
                    {client.profilePictureUrl ? (
                      <img src={client.profilePictureUrl} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-xl">{client.name[0]}</span>
                    )}
                    {/* Active indicator */}
                    <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-[#252527] ${client.lastSessionDate ? 'bg-[#94fbdd]' : 'bg-gray-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{client.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <CalendarDaysIcon className="w-3 h-3" />
                        {client.lastSessionDate ? new Date(client.lastSessionDate).toLocaleDateString() : 'Aucune séance'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(COACH_SOCIAL, { state: { targetUserId: client.id } });
                    }}
                    className="p-3 rounded-2xl bg-white/5 text-gray-400 group-hover:text-[#94fbdd] group-hover:bg-[#94fbdd]/10 transition-all font-bold"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </button>
                  <ChevronRightIcon className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {filteredClients.length === 0 && !isLoading && (
          <div className="py-20 text-center flex flex-col items-center">
            <UsersIcon className="w-16 h-16 text-gray-800 mb-4" />
            <p className="text-gray-500 font-bold">Aucun athlète trouvé</p>
            <p className="text-gray-600 text-xs mt-2">Commence par inviter tes clients via leur code unique.</p>
          </div>
        )}
      </div>

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
