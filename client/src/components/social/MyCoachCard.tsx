import { useState, useEffect } from 'react';
import { AcademicCapIcon, UserMinusIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { coachingService } from '../../api/services/coachingService';
import { getImageUrl } from '../../utils/imageUtils';

export default function MyCoachCard() {
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchCoach = async () => {
    try {
      setLoading(true);
      const data = await coachingService.getMyCoach();
      setCoach(data);
    } catch (err) {
      console.error('Failed to fetch coach:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoach();
  }, []);

  const handleTerminate = async () => {
    if (!coach?.relationshipId) return;
    setActionLoading(true);
    try {
      await coachingService.terminateRelationship(coach.relationshipId);
      setCoach(null);
      setShowConfirm(false);
    } catch (err) {
      console.error('Failed to terminate coaching:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-[#18181b] rounded-2xl border border-white/5 p-6 animate-pulse">
      <div className="flex gap-4 items-center">
        <div className="w-14 h-14 bg-white/5 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/5 rounded w-1/3" />
          <div className="h-3 bg-white/5 rounded w-1/4" />
        </div>
      </div>
    </div>
  );

  if (!coach) return null;

  return (
    <div className="bg-[#18181b] rounded-2xl border border-white/5 p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#94fbdd]/10 rounded-xl border border-[#94fbdd]/20">
          <AcademicCapIcon className="h-6 w-6 text-[#94fbdd]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Mon Coach</h2>
          <p className="text-xs text-gray-500 font-medium tracking-wide italic">Accompagnement actif</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[#121214] p-4 rounded-xl border border-white/5 mb-6">
        <div className="w-14 h-14 rounded-full overflow-hidden border border-[#94fbdd]/30">
          {coach.profilePictureUrl ? (
            <img src={getImageUrl(coach.profilePictureUrl)} alt={coach.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#27272a] flex items-center justify-center">
              <AcademicCapIcon className="w-7 h-7 text-gray-500" />
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-lg text-white">{coach.name}</p>
        </div>
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3.5 px-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all font-bold text-sm"
        >
          <UserMinusIcon className="h-5 w-5" />
          Arrêter le suivi
        </button>
      ) : (
        <div className="space-y-4 animate-in zoom-in duration-200">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-200 leading-relaxed">
              Êtes-vous sûr de vouloir arrêter le suivi avec ce coach ? Vos séances ne lui seront plus visibles.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-3 text-sm font-bold text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleTerminate}
              disabled={actionLoading}
              className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmer"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
