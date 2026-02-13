import React, { useState } from 'react';
import { XMarkIcon, UserPlusIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import coachingApi from '../../api/coachingApi';

export default function AddClientModal({ isOpen, onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await coachingApi.createRequest(code.trim().toUpperCase());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCode('');
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to create coaching request:', err);
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface border border-border-subtle rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlusIcon className="w-6 h-6 text-primary" />
              Nouveau Client
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {!success ? (
            <div className="space-y-6">
              <p className="text-sm text-text-secondary">
                Entrez le <strong>Code Unique</strong> (Friend Code) de l'utilisateur pour lui envoyer une demande de coaching.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 px-1">
                    Code Client
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: MYO-ABCD-1234"
                    className="w-full bg-background border border-border-subtle focus:border-primary/50 text-white rounded-2xl px-5 py-4 text-center font-mono font-bold tracking-widest transition-all outline-none"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium animate-shake">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full bg-primary text-background font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  {loading ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlusIcon className="w-5 h-5" />
                      Envoyer l'invitation
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-4 border-emerald-500/30">
                <CheckCircleIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Demande envoyée !</h4>
                <p className="text-sm text-text-secondary mt-1 px-4">
                  Le client recevra une notification pour accepter votre demande.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
