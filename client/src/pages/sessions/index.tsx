import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'
import useGetAllUserSessions from '../../api/hooks/session/useGetAllUserSessions'
import { useSharedSessions } from '../../api/hooks/shared-session/useSharedSessions'
import type { Session } from '../../types/session.type'
import { CalendarDaysIcon, ClockIcon, CheckCircleIcon, UsersIcon, MapPinIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { getImageUrl } from '../../utils/imageUtils'

export default function Sessions() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const { data: sessions, isLoading, error } = useGetAllUserSessions()
    const { data: sharedSessions } = useSharedSessions()

    const getSharedSessionsForDate = (date: Date | undefined) => {
        if (!date || !sharedSessions) return []
        return sharedSessions.filter((session: any) => {
            if (!session.startTime) return false
            return isSameDay(new Date(session.startTime), date)
        })
    }

    const getSessionsForDate = (date: Date | undefined): Session[] => {
        if (!date || !sessions) return []
        return sessions.filter((session: Session) => {
            // Utiliser performedAt si la séance est complétée, sinon utiliser date
            const sessionDate = session.performedAt ? new Date(session.performedAt) : session.date ? new Date(session.date) : null
            if (!sessionDate) return false
            return isSameDay(sessionDate, date)
        })
    }

    const sessionsForSelectedDate = getSessionsForDate(selectedDate)
    const sharedSessionsForSelectedDate = getSharedSessionsForDate(selectedDate)

    const datesWithSessions = sessions
        ?.filter((session: Session) => session.date || session.performedAt)
        .map((session: Session) => {
            // Utiliser performedAt si disponible, sinon date
            return session.performedAt ? new Date(session.performedAt) : new Date(session.date!)
        }) || []

    const datesWithSharedSessions = sharedSessions
        ?.map((session: any) => new Date(session.startTime)) || []

    const customStyles = `
    /* ---------- Base / variables ---------- */
    .rdp {
      --rdp-cell-size: 40px;
      --rdp-accent-color: #94fbdd;
      --rdp-background-color: #94fbdd;
      margin: 0;
      font-family: inherit;
    }

    @media (min-width: 640px) {
        .rdp {
            --rdp-cell-size: 48px;
        }
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
        background-color: #121214 !important;
    }

    .rdp-root {
        color: #ffffff !important;
    }
    
    /* ---------- Caption (month) ---------- */
    /* ciblage précis du label (utilisé par DayPicker) */
    .rdp .rdp-caption,
    .rdp-caption {
      /* garde tes règles existantes si utiles */
      font-weight: 700;
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    .rdp .rdp-caption_label,
    .rdp-caption_label {
      color: #ffffff !important; /* FORCER la couleur du nom du mois */
    }

    @media (min-width: 640px) {
        .rdp-caption {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
        }
    }

    /* ---------- Navigation (chevrons) ---------- */
    /* forcer couleur du bouton + taille */
    .rdp .rdp-nav_button,
    .rdp-nav_button {
      color: #ffffff !important;
      width: 2rem;
      height: 2rem;
      border-radius: 0.75rem;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    @media (min-width: 640px) {
        .rdp-nav_button {
            width: 2.5rem;
            height: 2.5rem;
        }
    }

    .rdp-nav_button:hover {
      background-color: rgba(148, 251, 221, 0.2) !important;
      transform: scale(1.1);
    }

    /* cibler le SVG à l'intérieur du bouton (stroke / fill) */
    .rdp .rdp-nav_button svg,
    .rdp-nav_button svg {
      width: 1.25rem;
      height: 1.25rem;
      stroke: #ffffff !important;
      fill: #ffffff !important;
    }
    /* certains volumes internes utilisent path, on les force aussi */
    .rdp .rdp-nav_button svg path,
    .rdp-nav_button svg path {
      stroke: #ffffff !important;
      fill: #ffffff !important;
    }

    /* ---------- Head cells (lun, mar, mer...) ---------- */
    .rdp .rdp-head_cell,
    .rdp-head_cell {
      color: #ffffff !important;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      padding: 0.5rem;
    }

    @media (min-width: 640px) {
        .rdp-head_cell {
            font-size: 0.85rem;
        }
    }

    /* ---------- Days ---------- */
    .rdp-cell {
      padding: 2px;
    }

    @media (min-width: 640px) {
        .rdp-cell {
            padding: 3px;
        }
    }

    .rdp-day {
      border-radius: 0.75rem !important;
      font-weight: 600;
      color: #ffffff;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    @media (min-width: 640px) {
        .rdp-day {
            font-size: 1rem;
        }
    }

    .rdp-day_selected {
      background: #94fbdd !important;
      color: #121214 !important;
      font-weight: 800;
      box-shadow: 0 6px 16px rgba(148, 251, 221, 0.5);
      transform: scale(1.08);
    }

    .rdp-root {
      --rdp-accent-color: transparent !important;
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

    /* ---------- Modifiers (session/shared) ---------- */
    .session-day:not(.rdp-day_selected) {
      background: rgba(148, 251, 221, 0.3) !important;
      font-weight: 800;
    }

    .shared-session-day:not(.rdp-day_selected) {
      background: rgba(147, 51, 234, 0.3) !important;
      font-weight: 800;
    }

    .session-day.rdp-day_today:not(.rdp-day_selected) {
      background: rgba(148, 251, 221, 0.3) !important;
      border: 2.5px solid #94fbdd !important;
    }

    .session-day.rdp-day_selected {
      background: #94fbdd !important;
      border: 3px solid #94fbdd !important;
    }

    .shared-session-day.rdp-day_selected {
      background: #9333EA !important;
      border: 3px solid #9333EA !important;
    }

    /* ---------- Both session types on same day ---------- */
    .both-sessions-day:not(.rdp-day_selected) {
      background: linear-gradient(135deg, rgba(148, 251, 221, 0.3) 0%, rgba(148, 251, 221, 0.3) 50%, rgba(147, 51, 234, 0.3) 50%, rgba(147, 51, 234, 0.3) 100%) !important;
      font-weight: 800;
    }

    .both-sessions-day.rdp-day_selected {
      background: linear-gradient(135deg, #94fbdd 0%, #94fbdd 50%, #9333EA 50%, #9333EA 100%) !important;
      border: 3px solid #94fbdd !important;
    }

    /* small safety: for any element using currentColor inside rdp, ensure currentColor is white */
    .rdp, .rdp * {
      color: inherit;
    }

  `

    // Detect days that have BOTH types of sessions
    const datesWithBothSessions = datesWithSessions.filter(date =>
        datesWithSharedSessions.some(sharedDate =>
            isSameDay(date, sharedDate)
        )
    )

    const modifiers = {
        hasBothSessions: datesWithBothSessions,
        hasSession: datesWithSessions,
        hasSharedSession: datesWithSharedSessions,
    }

    const modifiersClassNames = {
        hasBothSessions: 'both-sessions-day',
        hasSession: 'session-day',
        hasSharedSession: 'shared-session-day',
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#121214]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#94fbdd]/20 border-t-[#94fbdd]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-[#94fbdd]/20 animate-pulse"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#121214]">
                <div className="text-center space-y-3 p-6">
                    <p className="text-red-400 font-semibold text-lg">Erreur lors du chargement</p>
                    <p className="text-gray-500 text-sm">Veuillez réessayer plus tard</p>
                </div>
            </div>
        )
    }

    return (
        <section className="min-h-screen bg-[#121214] pb-24">
            <style>{customStyles}</style>

            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Mes Séances</h1>
                    <p className="text-sm text-gray-400">
                        {sessions?.length || 0} séance{(sessions?.length || 0) > 1 ? 's' : ''} au total
                    </p>
                </div>

                {/* Calendrier */}
                <div className="bg-[#252527] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 border border-[#94fbdd]/10">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={fr}
                        modifiers={modifiers}
                        modifiersClassNames={modifiersClassNames}
                        showOutsideDays
                    />
                </div>

                {/* Détails des sessions */}
                {selectedDate ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h2 className="text-lg sm:text-xl font-bold text-white">
                                {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                            </h2>
                            <span className={`px-4 py-2 rounded-xl font-semibold text-sm w-fit ${sessionsForSelectedDate.length > 0 && sharedSessionsForSelectedDate.length > 0
                                ? 'bg-gradient-to-r from-[#94fbdd]/10 to-purple-500/10 border border-[#94fbdd]/30 text-white'
                                : sharedSessionsForSelectedDate.length > 0
                                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                                    : 'bg-[#94fbdd]/10 border border-[#94fbdd]/30 text-[#94fbdd]'
                                }`}>
                                {sessionsForSelectedDate.length + sharedSessionsForSelectedDate.length} séance{(sessionsForSelectedDate.length + sharedSessionsForSelectedDate.length) > 1 ? 's' : ''}
                            </span>
                        </div>

                        {sessionsForSelectedDate.length === 0 && sharedSessionsForSelectedDate.length === 0 ? (
                            <div className="bg-[#252527] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#94fbdd]/10">
                                <CalendarDaysIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">Aucune séance prévue</p>
                                <p className="text-gray-500 text-sm mt-1">Sélectionnez une autre date</p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {sessionsForSelectedDate.map((session) => (
                                    <SessionCard key={session.id} session={session} />
                                ))}
                                {sharedSessionsForSelectedDate.map((session: any) => (
                                    <SharedSessionCard key={session.id} session={session} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-[#252527] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#94fbdd]/10">
                        <CalendarDaysIcon className="h-12 w-12 sm:h-16 sm:w-16 text-[#94fbdd] mx-auto mb-4" />
                        <p className="text-white font-semibold text-base sm:text-lg">Sélectionnez une date</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Cliquez sur une date du calendrier pour voir les séances
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}

/* Unified design for session cards - both types share the same layout with their respective colors */
function SessionCard({ session }: { session: Session }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="bg-[#252527] rounded-2xl shadow-lg border border-[#94fbdd]/15 overflow-hidden transition-all hover:shadow-xl hover:border-[#94fbdd]/30">
            {/* Header */}
            <div
                className="p-4 sm:p-5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-bold text-white break-words">
                                {session.trainingProgram?.name || 'Programme'}
                            </h3>
                            {session.completed && (
                                <CheckCircleIcon className="h-5 w-5 text-[#94fbdd]/80 flex-shrink-0" />
                            )}
                        </div>

                        {session.notes && (
                            <p className="text-sm text-gray-400 break-words">{session.notes}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            {session.date && (
                                <div className="flex items-center gap-1 text-gray-400">
                                    <ClockIcon className="h-4 w-4 flex-shrink-0" />
                                    <span>{format(new Date(session.date), 'HH:mm', { locale: fr })}</span>
                                </div>
                            )}

                            {session.duration && (
                                <span className="text-gray-400 font-medium">{session.duration} min</span>
                            )}

                            <div className="px-2 py-1 rounded-lg bg-[#94fbdd]/10 text-[#94fbdd]/90 font-medium whitespace-nowrap">
                                {session.exercices?.length || 0} exercice{(session.exercices?.length || 0) > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${session.completed
                            ? 'bg-[#94fbdd]/10 text-[#94fbdd]/90 border border-[#94fbdd]/20'
                            : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                            }`}>
                            {session.completed ? 'Complétée' : 'À venir'}
                        </div>

                        {session.exercices && session.exercices.length > 0 && (
                            <button className="text-gray-400 hover:text-[#94fbdd] transition-colors">
                                {isExpanded ? (
                                    <ChevronUpIcon className="h-5 w-5" />
                                ) : (
                                    <ChevronDownIcon className="h-5 w-5" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Exercices expandable */}
            {isExpanded && session.exercices && session.exercices.length > 0 && (
                <div className="border-t border-[#94fbdd]/10 bg-[#121214]">
                    <div className="p-4 sm:p-5 space-y-3">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wide">
                            {session.completed ? 'Performances réalisées' : 'Exercices planifiés'}
                        </h4>
                        <div className="space-y-2">
                            {session.exercices.map((ex: any, index: number) => {
                                const hasPerformances = session.completed && ex.performances && ex.performances.length > 0

                                return (
                                    <div
                                        key={index}
                                        className="bg-[#252527] rounded-xl border border-[#94fbdd]/10 hover:border-[#94fbdd]/20 transition-colors overflow-hidden"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border-b border-[#94fbdd]/5">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-white break-words">
                                                    {ex.exercice?.name || `Exercice ${index + 1}`}
                                                </p>
                                                {ex.exercice?.groupes && ex.exercice.groupes.length > 0 && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {ex.exercice.groupes.map((g: any) => g.groupe.name).join(', ')}
                                                    </p>
                                                )}
                                            </div>

                                            {!hasPerformances && (
                                                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                                    {ex.sets && (
                                                        <span className="px-2 py-1 rounded-lg bg-[#94fbdd]/10 text-[#94fbdd]/90 font-medium whitespace-nowrap">
                                                            {ex.sets} séries
                                                        </span>
                                                    )}
                                                    {ex.reps && (
                                                        <span className="px-2 py-1 rounded-lg bg-gray-700/50 text-gray-300 font-medium whitespace-nowrap">
                                                            {ex.reps} reps
                                                        </span>
                                                    )}
                                                    {ex.weight && (
                                                        <span className="px-2 py-1 rounded-lg bg-gray-600/50 text-gray-200 font-medium whitespace-nowrap">
                                                            {ex.weight} kg
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {hasPerformances && (
                                            <div className="bg-[#121214] p-3">
                                                <div className="space-y-2">
                                                    {ex.performances.map((perf: any, perfIndex: number) => (
                                                        <div
                                                            key={perfIndex}
                                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-[#252527] rounded-lg border border-[#94fbdd]/10"
                                                        >
                                                            <span className="text-xs font-medium text-gray-500">
                                                                Série {perfIndex + 1}
                                                            </span>
                                                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                                                {perf.reps_effectuees && (
                                                                    <span className="px-2 py-1 rounded-lg bg-[#94fbdd]/10 text-[#94fbdd]/90 font-medium whitespace-nowrap">
                                                                        {perf.reps_effectuees} reps
                                                                    </span>
                                                                )}
                                                                {perf.weight && (
                                                                    <span className="px-2 py-1 rounded-lg bg-gray-700/50 text-gray-300 font-medium whitespace-nowrap">
                                                                        {perf.weight} kg
                                                                    </span>
                                                                )}
                                                                {perf.rpe && (
                                                                    <span className="px-2 py-1 rounded-lg bg-gray-600/50 text-gray-200 font-medium text-xs whitespace-nowrap">
                                                                        RPE: {perf.rpe}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function SharedSessionCard({ session }: { session: any }) {
    return (
        <div className="bg-[#252527] rounded-2xl shadow-lg border border-purple-500/15 overflow-hidden transition-all hover:shadow-xl hover:border-purple-500/30">
            <div className="p-4 sm:p-5">
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <UsersIcon className="h-5 w-5 text-purple-400/80 flex-shrink-0" />
                            <h3 className="text-base sm:text-lg font-bold text-white break-words">{session.title}</h3>
                        </div>

                        {session.description && (
                            <p className="text-sm text-gray-400 break-words">{session.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 text-gray-400">
                                <ClockIcon className="h-4 w-4 flex-shrink-0" />
                                <span>{format(new Date(session.startTime), 'HH:mm', { locale: fr })}</span>
                            </div>

                            {session.location && (
                                <div className="flex items-center gap-1 text-gray-400">
                                    <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                                    <span className="break-words">{session.location}</span>
                                </div>
                            )}

                            <div className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400/90 font-medium whitespace-nowrap">
                                {session.participants?.length || 0} / {session.maxParticipants || '∞'} participants
                            </div>

                            {session.group && (
                                <div className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400/90 font-medium whitespace-nowrap">
                                    {session.group.name}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-purple-500/10">
                            <img
                                src={getImageUrl(session.organizer?.profilePictureUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.organizer?.name || 'U')}&background=random`}
                                alt={session.organizer?.name}
                                className="h-6 w-6 rounded-full flex-shrink-0"
                            />
                            <span className="text-xs text-gray-400 break-words">
                                Organisé par <span className="font-medium text-gray-300">{session.organizer?.name}</span>
                            </span>
                        </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400/90 border border-purple-500/20 whitespace-nowrap self-start">
                        À venir
                    </div>
                </div>
            </div>
        </div>
    )
}



