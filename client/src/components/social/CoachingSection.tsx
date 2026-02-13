import React, { useState } from 'react';
import { AcademicCapIcon, UserPlusIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { coachingService } from '../../api/services/coachingService';

export default function CoachingSection() {
  const [uniqueCode, setUniqueCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniqueCode.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      await coachingService.requestCoaching(uniqueCode.trim().toUpperCase());
      setMessage({ type: 'success', text: 'Demande envoyée avec succès !' });
      setUniqueCode('');
    } catch (err: any) {
      console.error('Coaching request error:', err);
      const errorMsg = err.response?.data?.message || 'Une erreur est survenue.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#18181b] rounded-2xl border border-white/5 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#94fbdd]/10 rounded-xl border border-[#94fbdd]/20">
          <AcademicCapIcon className="h-6 w-6 text-[#94fbdd]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Espace Coach</h2>
          <p className="text-xs text-gray-500 font-medium">Suivez de nouveaux pratiquants</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="client-code" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
            Code du Pratiquant
          </label>
          <div className="relative group">
            <UserPlusIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#94fbdd] transition-colors" />
            <input
              id="client-code"
              type="text"
              placeholder="EX: A1B2C3D4"
              value={uniqueCode}
              onChange={(e) => setUniqueCode(e.target.value)}
              className="w-full bg-[#121214] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-[#94fbdd]/40 focus:ring-1 focus:ring-[#94fbdd]/20 transition-all font-mono tracking-widest placeholder:text-gray-600 placeholder:font-sans placeholder:tracking-normal"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !uniqueCode.trim()}
          className="w-full bg-[#94fbdd] text-[#121214] font-bold py-3.5 rounded-xl hover:bg-[#7de3c7] active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-[#94fbdd]/10"
        >
          {loading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span>Envoyer la demande</span>
            </>
          )}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${message.type === 'success'
              ? 'bg-[#94fbdd]/10 border-[#94fbdd]/20 text-[#94fbdd]'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
        >
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-white/5">
        <p className="text-[11px] text-gray-500 leading-relaxed italic text-center">
          Le pratiquant pourra accepter ou refuser votre demande depuis ses notifications. Une fois acceptée, vous aurez accès à son suivi.
        </p>
      </div>
    </div>
  );
}
