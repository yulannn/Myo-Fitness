import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserPlusIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useCreateCoachingRequest } from '../../api/hooks/coaching/useCreateCoachingRequest';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [code, setCode] = useState('');
  const createRequestMutation = useCreateCoachingRequest();
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      await createRequestMutation.mutateAsync(code.trim().toUpperCase());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCode('');
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create coaching request:', err);
    }
  }

  const loading = createRequestMutation.isPending;
  const error = (createRequestMutation.error as any)?.response?.data?.message || (createRequestMutation.error as any)?.message;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-[#1c1c1e] rounded-t-[32px] sm:rounded-[32px] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#94fbdd]/10 flex items-center justify-center">
                    <UserPlusIcon className="w-6 h-6 text-[#94fbdd]" />
                  </div>
                  <h3 className="text-xl font-black text-white">Nouveau Client</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-xl"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {!success ? (
                <div className="space-y-8">
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">
                    Saisis le <strong className="text-white">Code Unique</strong> de ton athlète pour lui envoyer une invitation. Il devra l'accepter pour que le suivi commence.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">
                        Code d'invitation
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ex: MYO-ABCD-1234"
                        className="w-full bg-[#121214] border border-white/5 focus:border-[#94fbdd]/30 text-white rounded-2xl px-6 py-5 text-center font-mono font-bold tracking-[0.2em] transition-all outline-none text-lg"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !code.trim()}
                      className="w-full bg-[#94fbdd] text-[#121214] font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 shadow-xl shadow-[#94fbdd]/10 uppercase tracking-widest text-sm"
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <UserPlusIcon className="w-6 h-6" />
                          Envoyer l'invitation
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 flex flex-col items-center text-center space-y-6"
                >
                  <div className="w-24 h-24 bg-[#94fbdd]/20 rounded-full flex items-center justify-center border-4 border-[#94fbdd]/10">
                    <CheckCircleIcon className="w-12 h-12 text-[#94fbdd]" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">Invitation envoyée !</h4>
                    <p className="text-sm text-gray-500 mt-2 font-medium">
                      Ton athlète recevra une notification pour accepter ton suivi.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
