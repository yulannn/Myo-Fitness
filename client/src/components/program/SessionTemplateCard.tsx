import { useState } from 'react';
import { PlayIcon, CalendarIcon, PencilIcon } from '@heroicons/react/24/solid';
import type { SessionTemplateDto } from '../../api/services/sessionTemplateService';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '../ui/modal';
import useScheduleFromTemplate from '../../api/hooks/session-template/useScheduleFromTemplate';
import useStartFromTemplate from '../../api/hooks/session-template/useStartFromTemplate';

interface SessionTemplateCardProps {
  template: SessionTemplateDto;
  onEdit?: () => void;
}

export default function SessionTemplateCard({ template, onEdit }: SessionTemplateCardProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const { mutate: scheduleSession, isPending: isScheduling } = useScheduleFromTemplate();
  const { mutate: startSession, isPending: isStarting } = useStartFromTemplate();

  const handleSchedule = () => {
    if (!selectedDate) return;

    scheduleSession(
      { templateId: template.id, dto: { date: selectedDate } },
      {
        onSuccess: () => {
          setShowScheduleModal(false);
          setSelectedDate('');
        },
      }
    );
  };

  const handleStartNow = () => {
    startSession({ templateId: template.id });
  };

  // Date minimale = aujourd'hui
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="bg-[#252527] rounded-2xl border border-[#94fbdd]/10 p-5 hover:border-[#94fbdd]/30 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">{template.name}</h3>
              <span className="text-xs bg-[#94fbdd]/10 text-[#94fbdd] px-2 py-1 rounded-full font-medium">
                Modèle
              </span>
            </div>
            {template.description && (
              <p className="text-sm text-gray-400">{template.description}</p>
            )}
            {template._count && (
              <p className="text-xs text-gray-500 mt-1">
                {template._count.instances} séance(s) planifiée(s)
              </p>
            )}
          </div>
        </div>

        {/* Liste des exercices */}
        <div className="space-y-2 mb-4">
          {template.exercises.map((ex, idx) => {
            const isCardio = ex.exercise?.type === 'CARDIO';

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-[#121214] rounded-lg"
              >
                <span className="text-sm text-white font-medium">
                  {ex.exercise?.name || 'Exercice'}
                </span>
                <span className="text-xs text-[#94fbdd] font-mono bg-[#252527] px-2 py-1 rounded">
                  {isCardio ? (
                    `${ex.duration || 15} min`
                  ) : (
                    <>
                      {ex.sets} × {ex.reps}
                      {ex.weight ? ` @ ${ex.weight}kg` : ''}
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleStartNow}
            disabled={isStarting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#94fbdd] text-[#121214] font-bold rounded-xl hover:bg-[#7de0c4] transition-colors disabled:opacity-50 shadow-lg shadow-[#94fbdd]/20"
          >
            <PlayIcon className="w-4 h-4" />
            <span className="text-sm">Démarrer</span>
          </button>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#121214] text-white font-bold rounded-xl border border-[#94fbdd]/20 hover:bg-[#252527] transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm">Planifier</span>
          </button>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Modifier le modèle</span>
          </button>
        )}
      </div>

      {/* Modal de planification */}
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
        <div className="p-6 bg-[#252527] text-white">
          <ModalHeader>
            <ModalTitle>Planifier {template.name}</ModalTitle>
          </ModalHeader>

          <div className="my-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choisir une date
            </label>
            <input
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#121214] border border-[#94fbdd]/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#94fbdd] focus:border-transparent"
            />
          </div>

          <ModalFooter>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="px-4 py-2.5 rounded-xl border border-[#94fbdd]/20 text-white font-bold hover:bg-[#121214] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSchedule}
              disabled={!selectedDate || isScheduling}
              className="px-4 py-2.5 bg-[#94fbdd] text-[#121214] font-bold rounded-xl hover:bg-[#7de0c4] transition-colors disabled:opacity-50 shadow-lg shadow-[#94fbdd]/10"
            >
              {isScheduling ? 'Planification...' : 'Planifier'}
            </button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}
