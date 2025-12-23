import { useState, useEffect } from 'react';
import { PlayIcon, ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import type { ExerciceMinimal } from '../../../types/exercice.type';
import useStartFromTemplate from '../../../api/hooks/session-template/useStartFromTemplate';
import useScheduleFromTemplate from '../../../api/hooks/session-template/useScheduleFromTemplate';
import { EditTemplateModal } from '../modal/EditTemplateModal';
import { BottomSheet, BottomSheetHeader, BottomSheetTitle, BottomSheetFooter } from '../modal/BottomSheet';
import { formatDateToISO } from '../../../utils/dateUtils';

interface TemplateCardProps {
  template: any;
  programId: number;
  availableExercises?: ExerciceMinimal[];
}

export const TemplateCard = ({ template, programId, availableExercises = [] }: TemplateCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const { mutate: startTemplate, isPending: isStarting } = useStartFromTemplate();
  const { mutate: scheduleTemplate, isPending: isScheduling } = useScheduleFromTemplate();

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

  const handleStart = () => {
    startTemplate({ templateId: template.id });
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

  // Formatter la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const isToday = scheduledInstance?.date && new Date(scheduledInstance.date).toDateString() === new Date().toDateString();

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
      <div className={`
        relative rounded-xl overflow-hidden bg-[#252527] border transition-all
        ${scheduledInstance
          ? isToday
            ? 'border-[#94fbdd]/50 shadow-lg shadow-[#94fbdd]/10'
            : 'border-[#94fbdd]/30'
          : 'border-white/5 hover:border-white/10'
        }
      `}>
        {/* Content */}
        <div className="p-5">
          {/* Header : Titre + Expand button */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 truncate">
                {template.name}
              </h3>

              {template.description && (
                <p className="text-sm text-gray-500 line-clamp-1 mb-3">
                  {template.description}
                </p>
              )}

              {/* Métadonnées : Date planifiée + Nombre d'exercices */}
              <div className="flex items-center gap-3 text-sm">
                {/* Date planifiée */}
                {scheduledInstance?.date && (
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className={`w-4 h-4 ${isToday ? 'text-[#94fbdd]' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isToday ? 'text-[#94fbdd]' : 'text-gray-300'}`}>
                      {formatDate(scheduledInstance.date)}
                    </span>
                    {isToday && (
                      <span className="ml-1 px-2 py-0.5 bg-[#94fbdd]/20 text-[#94fbdd] text-xs font-bold rounded">
                        Aujourd'hui
                      </span>
                    )}
                  </div>
                )}

                {scheduledInstance?.date && <span className="text-gray-600">•</span>}

                {/* Nombre d'exercices */}
                <span className="text-gray-500">
                  {template.exercises?.length || 0} exercice{(template.exercises?.length || 0) > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Expand button */}
            {template.exercises && template.exercises.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
                title={isExpanded ? 'Masquer' : 'Voir les exercices'}
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* Actions : 3 boutons alignés horizontalement */}
          <div className="grid grid-cols-3 gap-2">
            {/* Modifier */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors font-medium text-sm"
              title="Modifier"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Modifier</span>
            </button>

            {/* Planifier/Modifier date */}
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors font-medium text-sm"
              title={scheduledInstance ? "Modifier la date" : "Planifier"}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{scheduledInstance ? 'Date' : 'Planifier'}</span>
            </button>

            {/* Démarrer */}
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#94fbdd] hover:bg-[#7de0c4] text-[#121214] rounded-lg transition-colors font-bold text-sm disabled:opacity-50 shadow-lg shadow-[#94fbdd]/20"
              title="Démarrer"
            >
              <PlayIcon className="w-4 h-4" />
              <span>{isStarting ? '...' : 'Démarrer'}</span>
            </button>
          </div>
        </div>

        {/* Liste d'exercices (expandable) */}
        {isExpanded && template.exercises && template.exercises.length > 0 && (
          <div className="border-t border-white/5 bg-black/20 p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Exercices
            </p>
            {template.exercises.map((ex: any, idx: number) => (
              <div
                key={ex.id || idx}
                className="flex items-center justify-between p-3 bg-[#121214] rounded-lg border border-white/5"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {ex.exercise?.name || 'Exercice'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ex.sets} séries × {ex.reps} reps
                    {ex.weight && ` @ ${ex.weight}kg`}
                  </p>
                </div>
              </div>
            ))}
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
    </>
  );
};
