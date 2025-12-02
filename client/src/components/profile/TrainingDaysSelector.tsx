import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { WeekDay } from '../../types/fitness-profile.type';

interface TrainingDaysSelectorProps {
    selectedDays: WeekDay[];
    maxSelections: number;
    onChange: (days: WeekDay[]) => void;
}

interface DayOption {
    value: WeekDay;
    label: string;
    shortLabel: string;
    emoji: string;
}

const WEEK_DAYS: DayOption[] = [
    { value: 'MONDAY', label: 'Lundi', shortLabel: 'Lun', emoji: '💪' },
    { value: 'TUESDAY', label: 'Mardi', shortLabel: 'Mar', emoji: '🔥' },
    { value: 'WEDNESDAY', label: 'Mercredi', shortLabel: 'Mer', emoji: '⚡' },
    { value: 'THURSDAY', label: 'Jeudi', shortLabel: 'Jeu', emoji: '🎯' },
    { value: 'FRIDAY', label: 'Vendredi', shortLabel: 'Ven', emoji: '💯' },
    { value: 'SATURDAY', label: 'Samedi', shortLabel: 'Sam', emoji: '🏆' },
    { value: 'SUNDAY', label: 'Dimanche', shortLabel: 'Dim', emoji: '✨' },
];

export default function TrainingDaysSelector({
    selectedDays,
    maxSelections,
    onChange,
}: TrainingDaysSelectorProps) {
    const handleDayToggle = (day: WeekDay) => {
        const isSelected = selectedDays.includes(day);

        if (isSelected) {
            // Retirer le jour sélectionné
            onChange(selectedDays.filter(d => d !== day));
        } else {
            // Ajouter le jour si on n'a pas atteint la limite
            if (selectedDays.length < maxSelections) {
                onChange([...selectedDays, day]);
            }
        }
    };

    const isMaxReached = selectedDays.length >= maxSelections;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-5 w-5 text-[#94fbdd]" />
                    <label className="text-sm font-medium text-gray-300">
                        Jours d'entraînement préférés
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">
                        {selectedDays.length}/{maxSelections}
                    </span>
                    {selectedDays.length === 0 && (
                        <span className="text-xs text-gray-500 italic">
                            (Planification manuelle)
                        </span>
                    )}
                </div>
            </div>

            {/* Info Badge */}
            {maxSelections > 0 && (
                <div className="px-3 py-2 rounded-lg bg-[#94fbdd]/5 border border-[#94fbdd]/10">
                    <p className="text-xs text-gray-400">
                        {selectedDays.length === 0 ? (
                            <>
                                💡 Sélectionnez vos jours préférés pour une planification automatique,
                                ou laissez vide pour gérer manuellement.
                            </>
                        ) : (
                            <>
                                ✓ Vos séances seront automatiquement planifiées ces jours-là
                            </>
                        )}
                    </p>
                </div>
            )}

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {WEEK_DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    const isDisabled = !isSelected && isMaxReached;

                    return (
                        <button
                            key={day.value}
                            type="button"
                            onClick={() => handleDayToggle(day.value)}
                            disabled={isDisabled}
                            className={`
                                relative group
                                aspect-square rounded-xl p-2
                                flex flex-col items-center justify-center
                                transition-all duration-200
                                ${isSelected
                                    ? 'bg-[#94fbdd] border-2 border-[#94fbdd] shadow-lg shadow-[#94fbdd]/30 scale-105'
                                    : isDisabled
                                        ? 'bg-[#121214] border-2 border-[#94fbdd]/10 opacity-40 cursor-not-allowed'
                                        : 'bg-[#121214] border-2 border-[#94fbdd]/20 hover:border-[#94fbdd]/50 hover:bg-[#94fbdd]/5'
                                }
                            `}
                            title={isDisabled ? `Maximum ${maxSelections} jours atteint` : day.label}
                        >
                            {/* Emoji */}
                            <span className="text-xl mb-0.5">
                                {day.emoji}
                            </span>

                            {/* Label */}
                            <span
                                className={`
                                    text-[10px] font-bold uppercase tracking-tight
                                    ${isSelected ? 'text-[#121214]' : 'text-gray-400 group-hover:text-[#94fbdd]'}
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

                            {/* Disabled overlay */}
                            {isDisabled && (
                                <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-gray-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                        />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected days summary */}
            {selectedDays.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedDays.map((dayValue) => {
                        const day = WEEK_DAYS.find(d => d.value === dayValue);
                        if (!day) return null;

                        return (
                            <div
                                key={dayValue}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#94fbdd]/10 border border-[#94fbdd]/30"
                            >
                                <span className="text-sm">{day.emoji}</span>
                                <span className="text-xs font-semibold text-[#94fbdd]">
                                    {day.label}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleDayToggle(dayValue)}
                                    className="ml-1 text-[#94fbdd]/70 hover:text-[#94fbdd] transition-colors"
                                >
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Clear all button */}
            {selectedDays.length > 0 && (
                <button
                    type="button"
                    onClick={() => onChange([])}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-[#121214] hover:bg-[#94fbdd]/5 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all"
                >
                    🗑️ Tout effacer (Planification manuelle)
                </button>
            )}
        </div>
    );
}
