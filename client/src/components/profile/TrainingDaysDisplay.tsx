import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { WeekDay } from '../../types/fitness-profile.type';

interface TrainingDaysDisplayProps {
  selectedDays: WeekDay[];
}

interface DayOption {
  value: WeekDay;
  label: string;
  shortLabel: string;
}

const WEEK_DAYS: DayOption[] = [
  { value: 'MONDAY', label: 'Lundi', shortLabel: 'Lun' },
  { value: 'TUESDAY', label: 'Mardi', shortLabel: 'Mar' },
  { value: 'WEDNESDAY', label: 'Mercredi', shortLabel: 'Mer' },
  { value: 'THURSDAY', label: 'Jeudi', shortLabel: 'Jeu' },
  { value: 'FRIDAY', label: 'Vendredi', shortLabel: 'Ven' },
  { value: 'SATURDAY', label: 'Samedi', shortLabel: 'Sam' },
  { value: 'SUNDAY', label: 'Dimanche', shortLabel: 'Dim' },
];

export default function TrainingDaysDisplay({ selectedDays }: TrainingDaysDisplayProps) {
  return (
    <div className="bg-[#121214] p-6 rounded-2xl border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all group">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#94fbdd]/10 rounded-xl group-hover:bg-[#94fbdd]/20 transition-colors">
          <CalendarDaysIcon className="h-6 w-6 text-[#94fbdd]" />
        </div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">
          Jours d'entraînement
        </h3>
      </div>

      {/* Days Display */}
      {selectedDays && selectedDays.length > 0 ? (
        <div className="space-y-4">
          {/* Visual Calendar Week */}
          <div className="grid grid-cols-7 gap-2 pt-2">
            {WEEK_DAYS.map((day) => {
              const isSelected = selectedDays.includes(day.value);

              return (
                <div
                  key={day.value}
                  className={`
                                        relative
                                        aspect-square rounded-xl p-2
                                        flex flex-col items-center justify-center
                                        transition-all duration-200
                                        ${isSelected
                      ? 'bg-[#94fbdd] border-2 border-[#94fbdd] shadow-lg shadow-[#94fbdd]/30 scale-105'
                      : 'bg-[#252527] border-2 border-[#94fbdd]/10 opacity-50'
                    }
                                    `}
                >
                  {/* Label */}
                  <span
                    className={`
                                            text-[10px] font-bold uppercase tracking-tight
                                            ${isSelected ? 'text-[#121214]' : 'text-gray-600'}
                                        `}
                  >
                    {day.shortLabel}
                  </span>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#121214] rounded-full flex items-center justify-center shadow-md">
                      <svg
                        className="w-3 h-3 text-[#94fbdd]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-[#94fbdd]/10">
            <span className="text-xs text-gray-500">
              Planning automatique activé
            </span>
            <span className="text-xs font-semibold text-[#94fbdd] bg-[#94fbdd]/10 px-3 py-1 rounded-lg">
              {selectedDays.length} jour{selectedDays.length > 1 ? 's' : ''} sélectionné{selectedDays.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[#252527] border-2 border-dashed border-[#94fbdd]/20 flex items-center justify-center">
            <CalendarDaysIcon className="h-8 w-8 text-gray-600" />
          </div>
          <p className="text-sm text-gray-500 italic">
            Aucun jour sélectionné
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Planification manuelle
          </p>
        </div>
      )}
    </div>
  );
}
