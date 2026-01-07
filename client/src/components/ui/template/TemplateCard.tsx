import { useState, useEffect } from 'react';
import { PlayIcon, ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, CalendarIcon, TrashIcon } from '@heroicons/react/24/solid';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import useStartFromTemplate from '../../../api/hooks/session-template/useStartFromTemplate';
import useScheduleFromTemplate from '../../../api/hooks/session-template/useScheduleFromTemplate';
import useDeleteSessionTemplate from '../../../api/hooks/session-template/useDeleteSessionTemplate';
import { EditTemplateModal } from '../modal/EditTemplateModal';
import { BottomSheet, BottomSheetHeader, BottomSheetTitle, BottomSheetFooter } from '../modal/BottomSheet';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '../modal';
import { formatDateToISO } from '../../../utils/dateUtils';
import { getExerciseImageUrl } from '../../../utils/imageUtils';

interface TemplateCardProps {
  template: any;
  programId: number;
  availableExercises?: ExerciceMinimal[];
}

export const TemplateCard = ({ template, availableExercises = [] }: TemplateCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isConfirmStartModalOpen, setIsConfirmStartModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

  const { mutate: startTemplate, isPending: isStarting } = useStartFromTemplate();
  const { mutate: scheduleTemplate, isPending: isScheduling } = useScheduleFromTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteSessionTemplate();

  // 🔍 Chercher l'instance planifiée (non complétée) pour ce template
  const scheduledInstance = template.instances?.find((instance: any) => !instance.completed);

  // État pour la date sélectionnée (Date object pour DayPicker)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    scheduledInstance?.date
      ? new Date(scheduledInstance.date)
      : new Date()
  );

  // 🔄 Synchroniser selectedDate avec scheduledInstance.date
  useEffect(() => {
    if (scheduledInstance?.date) {
      setSelectedDate(new Date(scheduledInstance.date));
    }
  }, [scheduledInstance?.date]);

  const handleStartClick = () => {
    setIsConfirmStartModalOpen(true);
  };

  const handleConfirmStart = () => {
    startTemplate({ templateId: template.id });
    setIsConfirmStartModalOpen(false);
  };

  const handleSchedule = () => {
    if (!selectedDate) return;

    // ✅ Convertir Date en string YYYY-MM-DD en utilisant l'heure LOCALE (pas UTC)
    const dateString = formatDateToISO(selectedDate);

    scheduleTemplate(
      {
        templateId: template.id,
        dto: { date: dateString }
      },
      {
        onSuccess: () => {
          setIsScheduleModalOpen(false);
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  // Styles CSS pour le DayPicker (identiques à la page sessions)
  const calendarStyles = `
    .rdp {
      --rdp-cell-size: 40px;
      --rdp-accent-color: #94fbdd;
      --rdp-background-color: #94fbdd;
      margin: 0;
      font-family: inherit;
    }

    .rdp-weekdays {
      color: #ffffff !important;
    }

    .rdp-today {
      color: #ffffff !important;
    }
    
    .rdp-months {
      justify-content: center;
    }

    .rdp-chevron polygon {
      fill: #ffffff !important;
    }

    .rdp-selected {
      background-color: #94fbdd !important;
      color: #121214 !important;
    }

    .rdp-root {
      color: #ffffff !important;
    }

    .rdp-caption_label {
      color: #ffffff !important;
    }

    .rdp-nav_button {
      color: #ffffff !important;
      width: 2rem;
      height: 2rem;
      border-radius: 0.75rem;
      transition: all 0.2s;
    }

    .rdp-nav_button:hover {
      background-color: rgba(148, 251, 221, 0.2) !important;
    }

    .rdp-nav_button svg {
      width: 1.25rem;
      height: 1.25rem;
      stroke: #ffffff !important;
      fill: #ffffff !important;
    }

    .rdp-head_cell {
      color: #ffffff !important;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      padding: 0.5rem;
    }

    .rdp-cell {
      padding: 2px;
    }

    .rdp-day {
      border-radius: 0.75rem !important;
      font-weight: 600;
      color: #ffffff;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .rdp-day_selected {
      background: #94fbdd !important;
      color: #121214 !important;
      font-weight: 800;
      box-shadow: 0 6px 16px rgba(148, 251, 221, 0.5);
    }

    .rdp-day_today:not(.rdp-day_selected) {
      font-weight: 800;
      background-color: rgba(148, 251, 221, 0.15);
      color: #94fbdd;
      border: 2px solid #94fbdd;
    }

    .rdp-day_outside {
      opacity: 0.3;
    }
  `;

  return (
    <>
      <style>{calendarStyles}</style>
      <div className="relative rounded-lg overflow-hidden bg-[#1a1a1c] border border-white/5 hover:border-white/10 transition-all">
        {/* Content */}
        <div className="p-3">
          {/* Header : Titre + Expand button */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white truncate">
                {template.name}
              </h3>

              {template.description && (
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  {template.description}
                </p>
              )}

              {/* Métadonnées : Date planifiée + Nombre d'exercices */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {/* Date planifiée */}
                {scheduledInstance?.date && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{formatDate(scheduledInstance.date)}</span>
                  </div>
                )}

                {scheduledInstance?.date && <span>•</span>}

                {/* Nombre d'exercices */}
                <span>
                  {template.exercises?.length || 0} exercice{(template.exercises?.length || 0) > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Expand button */}
            {template.exercises && template.exercises.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded text-gray-500 hover:text-white transition-colors flex-shrink-0"
                title={isExpanded ? 'Masquer' : 'Voir les exercices'}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Actions : 3 boutons alignés horizontalement */}
          <div className="flex items-center gap-1.5 mt-2">
            {/* Modifier */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-gray-300 rounded transition-colors"
              title="Modifier"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>

            {/* Planifier/Modifier date */}
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-gray-300 rounded transition-colors"
              title={scheduledInstance ? "Modifier la date" : "Planifier"}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>

            {/* Supprimer */}
            <button
              onClick={() => setIsConfirmDeleteModalOpen(true)}
              disabled={isDeleting}
              className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition-colors disabled:opacity-50"
              title="Supprimer la séance"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <TrashIcon className="w-4 h-4" />
              )}
            </button>

            <div className="flex-1" />

            {/* Démarrer - Icône seule */}
            <button
              onClick={handleStartClick}
              disabled={isStarting}
              className="p-1.5 bg-[#94fbdd] hover:bg-[#7de0c4] text-[#121214] rounded transition-colors disabled:opacity-50"
              title="Démarrer la séance"
            >
              {isStarting ? (
                <div className="w-4 h-4 border-2 border-[#121214] border-t-transparent rounded-full animate-spin" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Liste d'exercices (expandable) */}
        {isExpanded && template.exercises && template.exercises.length > 0 && (
          <div className="border-t border-white/5 bg-black/20 p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Exercices
            </p>
            {template.exercises.map((ex: any, idx: number) => {
              const isCardio = ex.exercise?.type === 'CARDIO';

              return (
                <div
                  key={ex.id || idx}
                  className="flex items-center gap-3 p-3 bg-[#121214] rounded-lg border border-white/5"
                >
                  {/* Image */}
                  <div className="relative w-12 h-12 rounded-lg bg-[#252527] overflow-hidden flex-shrink-0 border border-white/5">
                    {getExerciseImageUrl(ex.exercise?.imageUrl) ? (
                      <img
                        src={getExerciseImageUrl(ex.exercise?.imageUrl)!}
                        alt={ex.exercise?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerText = '🏋️‍♂️';
                          (e.target as HTMLImageElement).parentElement!.className += ' flex items-center justify-center text-lg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        🏋️‍♂️
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {ex.exercise?.name || 'Exercice'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isCardio ? (
                        `${ex.duration || 15} minutes`
                      ) : (
                        <>
                          {ex.sets} séries × {ex.reps} reps
                          {ex.weight && ` @ ${ex.weight}kg`}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Template Modal */}
      {isEditModalOpen && (
        <EditTemplateModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          template={template}
          availableExercises={availableExercises}
        />
      )}

      {/* Schedule Session Modal avec DayPicker */}
      <BottomSheet isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)}>
        <div className="px-6 pb-6 text-white">
          <BottomSheetHeader>
            <BottomSheetTitle>
              {scheduledInstance ? ' Modifier la date' : ' Planifier la séance'}
            </BottomSheetTitle>
          </BottomSheetHeader>

          <div className="my-6">
            <p className="text-sm text-gray-400 mb-6">
              {scheduledInstance
                ? `Modifiez la date de la séance`
                : `Choisissez quand effectuer`
              } <span className="font-bold text-white">{template.name}</span>
            </p>

            {/* DayPicker - Même style que page sessions */}
            <div className="bg-[#18181b] rounded-xl p-4 border border-white/5">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
                showOutsideDays={false}
                disabled={{ before: new Date() }}
              />
            </div>
          </div>

          <BottomSheetFooter>
            <div className="flex gap-3">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-white font-bold hover:bg-[#121214] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSchedule}
                disabled={!selectedDate || isScheduling}
                className="flex-1 px-4 py-3 bg-[#94fbdd] hover:bg-[#7de0c4] text-[#121214] font-bold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-[#94fbdd]/20"
              >
                {isScheduling ? 'Planification...' : 'Confirmer'}
              </button>
            </div>
          </BottomSheetFooter>
        </div>
      </BottomSheet>

      {/* Modal de confirmation pour démarrer */}
      <Modal isOpen={isConfirmStartModalOpen} onClose={() => setIsConfirmStartModalOpen(false)}>
        <ModalHeader>
          <ModalTitle className="text-lg">Démarrer la séance ?</ModalTitle>
        </ModalHeader>
        <div className="px-6 py-4 text-center">
          <p className="text-gray-300 text-sm">
            Vous allez démarrer la séance <span className="font-semibold text-white">{template.name}</span>
          </p>
        </div>
        <ModalFooter>
          <div className="flex gap-3">
            <button
              onClick={() => setIsConfirmStartModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmStart}
              disabled={isStarting}
              className="flex-1 px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {isStarting ? 'Démarrage...' : 'Démarrer'}
            </button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Modal de confirmation pour supprimer */}
      <Modal isOpen={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)}>
        <ModalHeader>
          <ModalTitle className="text-lg">Supprimer la séance ?</ModalTitle>
        </ModalHeader>
        <div className="px-6 py-4 text-center">
          <p className="text-gray-300 text-sm">
            Voulez-vous vraiment supprimer <span className="font-semibold text-white">{template.name}</span> ?
          </p>
          <p className="text-gray-500 text-xs mt-2">Cette action est irréversible.</p>
        </div>
        <ModalFooter>
          <div className="flex gap-3">
            <button
              onClick={() => setIsConfirmDeleteModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                deleteTemplate(template.id, {
                  onSuccess: () => setIsConfirmDeleteModalOpen(false)
                });
              }}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};
