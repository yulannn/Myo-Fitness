import { useState, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, isSameDay, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'
import useGetSessionsForCalendar from '../../api/hooks/session/useGetSessionsForCalendar'
import useGetSessionById from '../../api/hooks/session/useGetSessionById'
import { useSharedSessions } from '../../api/hooks/shared-session/useSharedSessions'
import { CalendarDaysIcon, CheckCircleIcon, UsersIcon, ChevronDownIcon, ChevronUpIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { getImageUrl } from '../../utils/imageUtils'

export default function Sessions() {
    // 📅 État pour le mois affiché dans le calendrier (par défaut : mois actuel)
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

    // 🎯 OPTIMISATION : Calculer les dates du mois affiché
    const monthStart = useMemo(() =>
        format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
        [currentMonth]
    )
    const monthEnd = useMemo(() =>
        format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
        [currentMonth]
    )

    // 🚀 OPTIMISÉ : Charger uniquement les données minimales pour le calendrier
    const { data: sessions, isLoading, error } = useGetSessionsForCalendar(monthStart, monthEnd)
    const { data: sharedSessions } = useSharedSessions()

    const getSharedSessionsForDate = (date: Date | undefined) => {
        if (!date || !sharedSessions) return []
        return sharedSessions.filter((session: any) => {
            if (!session.startTime) return false
            return isSameDay(new Date(session.startTime), date)
        })
    }

    const getSessionsForDate = (date: Date | undefined): any[] => {
        if (!date || !sessions) return []
        return sessions.filter((session: any) => {
            // Format optimisé utilise "date" pour les sessions planifiées et "performedAt" pour les complétées
            const sessionDate = session.performedAt ? new Date(session.performedAt) : session.date ? new Date(session.date) : null
            if (!sessionDate) return false
            return isSameDay(sessionDate, date)
        })
    }

    const sessionsForSelectedDate = getSessionsForDate(selectedDate)
    const sharedSessionsForSelectedDate = getSharedSessionsForDate(selectedDate)

    const datesWithSessions = sessions
        ?.filter((session: any) => session.date || session.performedAt)
        .map((session: any) => {
            return session.performedAt ? new Date(session.performedAt) : new Date(session.date)
        }) || []

    const datesWithSharedSessions = sharedSessions
        ?.filter((session: any) => session.startTime)
        .map((session: any) => new Date(session.startTime)) || []

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
                <div className="bg-[#18181b] rounded-xl shadow-lg p-4 sm:p-6 border border-white/5">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        locale={fr}
                        modifiers={modifiers}
                        modifiersClassNames={modifiersClassNames}
                        showOutsideDays={false}
                    />
                </div>

                {/* Détails des sessions */}
                {selectedDate ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h2 className="text-lg sm:text-xl font-bold text-white">
                                {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                            </h2>
                            <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-gray-400 border border-white/5">
                                {sessionsForSelectedDate.length + sharedSessionsForSelectedDate.length} séance{(sessionsForSelectedDate.length + sharedSessionsForSelectedDate.length) > 1 ? 's' : ''}
                            </span>
                        </div>

                        {sessionsForSelectedDate.length === 0 && sharedSessionsForSelectedDate.length === 0 ? (
                            <div className="bg-[#18181b] rounded-xl p-8 sm:p-12 text-center border border-white/5">
                                <CalendarDaysIcon className="h-12 w-12 sm:h-16 sm:w-16 text-white mx-auto mb-4" />
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
                    <div className="bg-[#18181b] rounded-xl p-8 sm:p-12 text-center border border-white/5">
                        <CalendarDaysIcon className="h-12 w-12 sm:h-16 sm:w-16 text-white mx-auto mb-4" />
                        <p className="text-white font-semibold text-base sm:text-lg">Sélectionnez une date</p>
                        <p className="text-gray-500 text-sm mt-1">
                            Cliquez sur une date du calendrier pour voir les séances
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}

/* Unified design for session cards - both types share the same layout with their respective colors */
function SessionCard({ session }: { session: any }) {
    const [isExpanded, setIsExpanded] = useState(false)

    // 🚀 Lazy loading: charger les détails complets SEULEMENT si la carte est étendue
    const { data: fullSession, isLoading: isLoadingDetails } = useGetSessionById(
        isExpanded ? session.id : null
    )

    // Déterminer si on peut expand (si il y a des exercices)
    // Pour sessions complétées : vérifier exercices
    // Pour sessions non complétées : vérifier sessionTemplate.exercises
    const exerciseCount = session._count?.exercices || 0
    const templateExerciseCount = session.sessionTemplate?._count?.exercises || 0
    const canExpand = exerciseCount > 0 || templateExerciseCount > 0

    // 🔍 Déterminer si la séance est dans le passé et non validée
    const sessionDate = session.performedAt ? new Date(session.performedAt) : session.date ? new Date(session.date) : null
    const isPastSession = sessionDate ? sessionDate < new Date() && !isSameDay(sessionDate, new Date()) : false
    const isNotCompleted = !session.completed
    const showMissedIndicator = isPastSession && isNotCompleted

    return (
        <div className="bg-[#18181b] rounded-lg border border-white/5 overflow-hidden transition-all hover:border-white/10 group">
            {/* Header */}
            <div
                className={`p-4 ${canExpand ? 'cursor-pointer hover:bg-white/[0.02]' : ''} transition-colors`}
                onClick={() => canExpand && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-white truncate">
                                {session.trainingProgram?.name || 'Programme'}
                            </h3>
                            {session.completed && (
                                <CheckCircleIcon className="h-4 w-4 text-[#94fbdd]" />
                            )}
                            {showMissedIndicator && (
                                <QuestionMarkCircleIcon className="h-4 w-4 text-orange-400" />
                            )}
                        </div>

                        {(session.sessionName || session.summary?.duration || exerciseCount > 0) && (
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                {session.summary?.duration && (
                                    <span>{session.summary.duration} min</span>
                                )}
                                {(session.summary?.duration && exerciseCount) && <span>•</span>}
                                {exerciseCount > 0 && (
                                    <span>{exerciseCount} exercice{exerciseCount > 1 ? 's' : ''}</span>
                                )}
                            </div>
                        )}

                        {session.sessionName && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-1">{session.sessionName}</p>
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

                    <div className="flex items-center gap-3">
                        {canExpand && (
                            <button className="text-gray-600 group-hover:text-gray-400 transition-colors bg-white/5 p-1.5 rounded-md">
                                {isExpanded ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Détails complets avec lazy loading */}
            {isExpanded && canExpand && (
                <div className="border-t border-white/5 bg-black/20">
                    {isLoadingDetails ? (
                        <div className="p-8 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#94fbdd]"></div>
                        </div>
                    ) : fullSession ? (
                        <div className="p-4 space-y-3">
                            <div className="space-y-2">
                                {/* 🔄 Afficher les exercices depuis le template si non complété, sinon depuis exercices */}
                                {(() => {
                                    // Pour sessions non complétées : utiliser sessionTemplate.exercises
                                    const exercises = !fullSession.completed && fullSession.sessionTemplate?.exercises
                                        ? fullSession.sessionTemplate.exercises.map((exTemplate: any) => ({
                                            exercice: {
                                                name: exTemplate.exercise?.name,
                                                type: exTemplate.exercise?.type
                                            },
                                            sets: exTemplate.sets,
                                            reps: exTemplate.reps,
                                            weight: exTemplate.weight,
                                            duration: exTemplate.duration,
                                            performances: null
                                        }))
                                        : (fullSession.exercices || []).map((ex: any) => ({
                                            ...ex,
                                            exercice: {
                                                ...ex.exercice,
                                                type: ex.exercice?.type
                                            }
                                        }));

                                    return exercises.map((ex: any, index: number) => {
                                        const hasPerformances = fullSession.completed && ex.performances && ex.performances.length > 0
                                        const isCardio = ex.exercice?.type === 'CARDIO'

                                        return (
                                            <div
                                                key={index}
                                                className="bg-[#18181b] rounded-md border border-white/5 p-3"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white">
                                                            {ex.exercice?.name || `Exercice ${index + 1}`}
                                                        </p>
                                                    </div>

                                                    {!hasPerformances && (
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            {isCardio ? (
                                                                <span>{ex.duration || 15} min</span>
                                                            ) : (
                                                                <>
                                                                    {ex.sets && <span>{ex.sets} séries</span>}
                                                                    {ex.reps && <span>{ex.reps} reps</span>}
                                                                    {ex.weight && <span>{ex.weight} kg</span>}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {hasPerformances && (
                                                    <div className="mt-3 space-y-1">
                                                        {ex.performances.map((perf: any, perfIndex: number) => (
                                                            <div
                                                                key={perfIndex}
                                                                className="flex items-center justify-between text-xs text-gray-500 py-1 border-t border-white/5 first:border-0"
                                                            >
                                                                <span>{isCardio ? 'Cardio' : `Série ${perfIndex + 1}`}</span>
                                                                <div className="flex items-center gap-3">
                                                                    {isCardio ? (
                                                                        perf.reps_effectuees && <span>{perf.reps_effectuees} min</span>
                                                                    ) : (
                                                                        <>
                                                                            {perf.reps_effectuees && <span>{perf.reps_effectuees} reps</span>}
                                                                            {perf.weight && <span>{perf.weight} kg</span>}
                                                                            {perf.rpe && <span>RPE {perf.rpe}</span>}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {/* 📊 Résumé de session (uniquement si complétée ET summary existe) */}
                            {fullSession.completed && fullSession.summary && (
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                        📊 Résumé de performance
                                    </h5>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {fullSession.summary.totalSets ? (
                                            <div className="bg-[#18181b] rounded-md border border-white/5 p-3">
                                                <p className="text-xs text-gray-500">Séries totales</p>
                                                <p className="text-lg font-bold text-[#94fbdd] mt-1">
                                                    {fullSession.summary.totalSets}
                                                </p>
                                            </div>
                                        ) : null}
                                        {fullSession.summary.totalReps ? (
                                            <div className="bg-[#18181b] rounded-md border border-white/5 p-3">
                                                <p className="text-xs text-gray-500">Reps totales</p>
                                                <p className="text-lg font-bold text-[#94fbdd] mt-1">
                                                    {fullSession.summary.totalReps}
                                                </p>
                                            </div>
                                        ) : null}
                                        {fullSession.summary.totalVolume ? (
                                            <div className="bg-[#18181b] rounded-md border border-white/5 p-3">
                                                <p className="text-xs text-gray-500">Volume total</p>
                                                <p className="text-lg font-bold text-[#94fbdd] mt-1">
                                                    {Math.round(fullSession.summary.totalVolume)} kg
                                                </p>
                                            </div>
                                        ) : null}
                                        {fullSession.summary.caloriesBurned ? (
                                            <div className="bg-[#18181b] rounded-md border border-white/5 p-3">
                                                <p className="text-xs text-gray-500">Calories brûlées</p>
                                                <p className="text-lg font-bold text-[#94fbdd] mt-1">
                                                    {Math.round(fullSession.summary.caloriesBurned)} kcal
                                                </p>
                                            </div>
                                        ) : null}

                                        {fullSession.summary.muscleGroups && fullSession.summary.muscleGroups.length > 0 && (
                                            <div className="bg-[#18181b] rounded-md border border-white/5 p-3 col-span-2 sm:col-span-2">
                                                <p className="text-xs text-gray-500 mb-2">Groupes musculaires</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {fullSession.summary.muscleGroups.map((muscle: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 bg-[#94fbdd]/10 text-[#94fbdd] text-xs rounded-full capitalize"
                                                        >
                                                            {muscle}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}

function SharedSessionCard({ session }: { session: any }) {
    return (
        <div className="bg-[#18181b] rounded-lg border border-white/5 overflow-hidden transition-all hover:border-purple-500/20 group">
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-purple-400" />
                            <h3 className="text-base font-semibold text-white truncate">{session.title}</h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            {session.startTime && (
                                <span>{format(new Date(session.startTime), 'HH:mm', { locale: fr })}</span>
                            )}
                            {(session.startTime && session.location) && <span>•</span>}
                            {session.location && (
                                <span className="truncate">{session.location}</span>
                            )}
                        </div>

                        {session.description && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-1">{session.description}</p>
                        )}

                        <div className="pt-2 flex items-center gap-2">
                            <img
                                src={getImageUrl(session.organizer?.profilePictureUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.organizer?.name || 'U')}&background=random`}
                                alt={session.organizer?.name}
                                className="h-5 w-5 rounded-full flex-shrink-0 opacity-70"
                            />
                            <span className="text-xs text-gray-500">
                                {session.organizer?.name}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}



