import { PlayIcon, CalendarIcon, TrashIcon, QuestionMarkCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerformanceStore } from '../../store/usePerformanceStore';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '../ui/modal';
import useUpdateSessionDate from '../../api/hooks/session/useUpdateSessionDate';
import useDeleteSessionFromProgram from '../../api/hooks/program/useDeleteSessionFromProgram';

interface ScheduledSessionCardProps {
  session: any; // TrainingSession type
  programName?: string;
  templateName?: string;
}

export default function ScheduledSessionCard({
  session,
  programName,
  templateName
}: ScheduledSessionCardProps) {
  const navigate = useNavigate();
  const { setSessionId, setActiveSession, setStartTime } = usePerformanceStore();
  const [showDateModal, setShowDateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newDate, setNewDate] = useState('');

  const { mutate: updateDate, isPending: isUpdatingDate } = useUpdateSessionDate(session.id);
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSessionFromProgram();

  const handleStartSession = () => {
    setSessionId(session.id);
    setActiveSession(session);
    setStartTime(Date.now());
    navigate('/active-session');
  };

  const handleUpdateDate = () => {
    if (!newDate) return;

    updateDate(
      { date: newDate },
      {
        onSuccess: () => {
          setShowDateModal(false);
          setNewDate('');
        },
      }
    );
  };

  const handleDelete = () => {
    // Le hook attend juste le sessionId
    deleteSession(session.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const minDate = new Date().toISOString().split('T')[0];
  const isToday = session.date && new Date(session.date).toDateString() === new Date().toDateString();

  // 🔍 Déterminer si la séance est dans le passé et non validée
  const sessionDate = session.date ? new Date(session.date) : null;
  const isPastSession = sessionDate ? sessionDate < new Date() && !isToday : false;
  const isCompleted = session.completed || false;
  const showMissedIndicator = isPastSession && !isCompleted;

  return (
    <>
      <div className={`bg-[#252527] rounded-2xl border p-5 hover:border-[#94fbdd]/30 transition-all ${isToday ? 'border-[#94fbdd]/50' : 'border-[#94fbdd]/10'
        }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {session.date && (
                <span className="text-xs bg-[#94fbdd]/20 text-[#94fbdd] px-2 py-1 rounded-full font-bold">
                  {formatDate(session.date)}
                </span>
              )}
              {isToday && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">
                  Aujourd'hui
                </span>
              )}
              {isCompleted && (
                <CheckCircleIcon className="h-4 w-4 text-[#94fbdd]" />
              )}
              {showMissedIndicator && (
                <QuestionMarkCircleIcon className="h-4 w-4 text-orange-400" />
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {session.sessionName || 'Séance'}
            </h3>
            {templateName && (
              <p className="text-xs text-gray-500">
                Basé sur : <span className="text-[#94fbdd]">{templateName}</span>
              </p>
            )}

            {/* Message pour séance non validée dans le passé */}
            {showMissedIndicator && (
              <div className="mt-2 p-2 bg-orange-400/10 border border-orange-400/20 rounded-md">
                <p className="text-xs text-orange-400 font-medium">
                  ⚠️ Non effectuée
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Exercices preview */}
        {session.exercices && session.exercices.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">
              {session.exercices.length} exercice(s)
            </p>
            <div className="space-y-1">
              {session.exercices.slice(0, 3).map((ex: any, idx: number) => (
                <div key={idx} className="text-sm text-gray-400">
                  • {ex.exercice?.name || 'Exercice'}
                </div>
              ))}
              {session.exercices.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{session.exercices.length - 3} autre(s)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleStartSession}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#94fbdd] text-[#121214] font-bold rounded-xl hover:bg-[#7de0c4] transition-colors shadow-lg shadow-[#94fbdd]/20"
          >
            <PlayIcon className="w-4 h-4" />
            <span className="text-sm">Démarrer</span>
          </button>

          <button
            onClick={() => {
              setNewDate(session.date ? new Date(session.date).toISOString().split('T')[0] : minDate);
              setShowDateModal(true);
            }}
            className="px-3 py-2.5 bg-[#121214] text-white rounded-xl border border-[#94fbdd]/20 hover:bg-[#252527] transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-2.5 bg-[#121214] text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal changement de date */}
      <Modal isOpen={showDateModal} onClose={() => setShowDateModal(false)}>
        <div className="p-6 bg-[#252527] text-white">
          <ModalHeader>
            <ModalTitle>Modifier la date</ModalTitle>
          </ModalHeader>

          <div className="my-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nouvelle date
            </label>
            <input
              type="date"
              min={minDate}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#121214] border border-[#94fbdd]/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#94fbdd] focus:border-transparent"
            />
          </div>

          <ModalFooter>
            <button
              onClick={() => setShowDateModal(false)}
              className="px-4 py-2.5 rounded-xl border border-[#94fbdd]/20 text-white font-bold hover:bg-[#121214] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleUpdateDate}
              disabled={!newDate || isUpdatingDate}
              className="px-4 py-2.5 bg-[#94fbdd] text-[#121214] font-bold rounded-xl hover:bg-[#7de0c4] transition-colors disabled:opacity-50"
            >
              {isUpdatingDate ? 'Mise à jour...' : 'Confirmer'}
            </button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Modal suppression */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6 bg-[#252527] text-white">
          <ModalHeader>
            <ModalTitle>Supprimer la séance ?</ModalTitle>
          </ModalHeader>

          <p className="text-gray-400 my-6">
            Cette action est irréversible. La séance sera supprimée définitivement.
          </p>

          <ModalFooter>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2.5 rounded-xl border border-[#94fbdd]/20 text-white font-bold hover:bg-[#121214] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}
