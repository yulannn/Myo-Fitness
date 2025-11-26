import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'
import useGetAllUserSessions from '../../api/hooks/session/useGetAllUserSessions'
import type { Session } from '../../types/session.type'
import { CalendarDaysIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function Sessions() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const { data: sessions, isLoading, error } = useGetAllUserSessions()

    // Filtrer les sessions pour la date sélectionnée
    const getSessionsForDate = (date: Date | undefined): Session[] => {
        if (!date || !sessions) return []
        return sessions.filter((session) => {
            if (!session.date) return false
            return isSameDay(new Date(session.date), date)
        })
    }

    const sessionsForSelectedDate = getSessionsForDate(selectedDate)

    // Récupérer toutes les dates ayant des sessions pour les mettre en évidence
    const datesWithSessions = sessions
        ?.filter((session) => session.date)
        .map((session) => new Date(session.date!)) || []

    // Custom CSS pour le calendrier avec couleurs de fond complètes
    const customStyles = `
    .rdp {
      --rdp-cell-size: 48px;
      --rdp-accent-color: #7CD8EE;
      --rdp-background-color: #7CD8EE;
      margin: 0;
      font-family: inherit;
    }
    
    .rdp-months {
      justify-content: center;
    }
    
    .rdp-caption {
      color: #2F4858;
      font-weight: 700;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }
    
    .rdp-nav_button {
      color: #7CD8EE;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      transition: all 0.2s;
    }
    
    .rdp-nav_button:hover {
      background-color: rgba(124, 216, 238, 0.2);
      transform: scale(1.1);
    }
    
    .rdp-head_cell {
      color: #2F4858;
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: uppercase;
      padding: 0.5rem;
    }
    
    .rdp-cell {
      padding: 3px;
    }
    
    .rdp-day {
      border-radius: 0.75rem;
      font-weight: 600;
      color: #2F4858;
      transition: all 0.2s;
      font-size: 1rem;
    }
    
    .rdp-day:hover:not(.rdp-day_selected) {
      background-color: rgba(124, 216, 238, 0.25) !important;
      transform: scale(1.05);
    }
    
    .rdp-day_selected {
      background: linear-gradient(135deg, #7CD8EE 0%, #2F4858 100%) !important;
      color: white !important;
      font-weight: 800;
      box-shadow: 0 6px 16px rgba(124, 216, 238, 0.5);
      transform: scale(1.08);
    }
    
    .rdp-day_today:not(.rdp-day_selected) {
      font-weight: 800;
      background-color: rgba(100, 47, 0, 0.15);
      color: #642F00;
      border: 2px solid #642F00;
    }
    
    .rdp-day_outside {
      opacity: 0.3;
    }
    
    /* Jours avec des sessions - fond coloré complet TRÈS VISIBLE */
    .session-day:not(.rdp-day_selected) {
      background: linear-gradient(135deg, rgba(124, 216, 238, 0.4) 0%, rgba(47, 72, 88, 0.25) 100%) !important;
      border: 2.5px solid rgba(124, 216, 238, 0.8) !important;
      font-weight: 800;
      box-shadow: 0 3px 10px rgba(124, 216, 238, 0.3);
    }
    
    .session-day:not(.rdp-day_selected):hover {
      background: linear-gradient(135deg, rgba(124, 216, 238, 0.6) 0%, rgba(47, 72, 88, 0.35) 100%) !important;
      border-color: rgba(124, 216, 238, 1) !important;
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(124, 216, 238, 0.5);
    }
    
    /* Jour avec session ET aujourd'hui */
    .session-day.rdp-day_today:not(.rdp-day_selected) {
      background: linear-gradient(135deg, rgba(124, 216, 238, 0.5) 0%, rgba(100, 47, 0, 0.2) 100%) !important;
      border: 2.5px solid #7CD8EE !important;
      box-shadow: 0 4px 12px rgba(124, 216, 238, 0.4);
    }
    
    /* Jour sélectionné avec session */
    .session-day.rdp-day_selected {
      background: linear-gradient(135deg, #7CD8EE 0%, #2F4858 100%) !important;
      border: 3px solid #7CD8EE !important;
      box-shadow: 0 8px 20px rgba(124, 216, 238, 0.7);
    }
  `

    const modifiers = {
        hasSession: datesWithSessions,
    }

    const modifiersClassNames = {
        hasSession: 'session-day',
    }

    if (isLoading) {
        return (
            <section className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7CD8EE] border-t-transparent"></div>
                    <p className="text-[#2F4858]/60 font-medium">Chargement des sessions...</p>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-2">
                    <p className="text-red-500 font-semibold">Erreur lors du chargement des sessions</p>
                    <p className="text-gray-500 text-sm">Veuillez réessayer plus tard</p>
                </div>
            </section>
        )
    }

    return (
        <section className="space-y-6 pb-24 p-4">
            <style>{customStyles}</style>

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7CD8EE] to-[#2F4858] shadow-lg">
                    <CalendarDaysIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#2F4858]">Mes Sessions</h1>
                    <p className="text-sm text-[#2F4858]/60">
                        {sessions?.length || 0} session{(sessions?.length || 0) > 1 ? 's' : ''} au total
                    </p>
                </div>
            </div>

            {/* Calendrier */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-[#7CD8EE]/30">
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
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#2F4858]">
                            Sessions du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                        </h2>
                        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-[#7CD8EE] to-[#2F4858] text-white font-semibold text-sm shadow-lg">
                            {sessionsForSelectedDate.length} session{sessionsForSelectedDate.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    {sessionsForSelectedDate.length === 0 ? (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 text-center border border-gray-200">
                            <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Aucune session prévue pour cette date</p>
                            <p className="text-gray-400 text-sm mt-1">Sélectionnez une autre date ou créez une nouvelle session</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sessionsForSelectedDate.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gradient-to-br from-[#7CD8EE]/10 to-[#2F4858]/10 rounded-3xl p-8 text-center border-2 border-[#7CD8EE]/30">
                    <CalendarDaysIcon className="h-16 w-16 text-[#7CD8EE] mx-auto mb-4" />
                    <p className="text-[#2F4858] font-semibold text-lg">Sélectionnez une date</p>
                    <p className="text-[#2F4858]/60 text-sm mt-1">
                        Cliquez sur une date du calendrier pour voir les sessions prévues
                    </p>
                    <p className="text-[#7CD8EE] text-xs mt-3 font-medium">
                        💡 Les jours colorés contiennent des sessions planifiées
                    </p>
                </div>
            )}
        </section>
    )
}

function SessionCard({ session }: { session: Session }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div
            className="bg-white rounded-2xl shadow-md border border-[#7CD8EE]/20 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
        >
            {/* Header de la carte */}
            <div
                className="p-5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        {/* Nom du programme */}
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-[#2F4858]">
                                {session.trainingProgram?.name || 'Programme'}
                            </h3>
                            {session.completed && (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            )}
                        </div>

                        {/* Notes de session */}
                        {session.notes && (
                            <p className="text-sm text-[#2F4858]/70 font-medium">{session.notes}</p>
                        )}

                        {/* Informations complémentaires */}
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            {session.date && (
                                <div className="flex items-center gap-1 text-[#2F4858]/60">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>{format(new Date(session.date), 'HH:mm', { locale: fr })}</span>
                                </div>
                            )}

                            {session.duration && (
                                <div className="flex items-center gap-1 text-[#2F4858]/60">
                                    <span className="font-semibold">{session.duration} min</span>
                                </div>
                            )}

                            <div className="px-2 py-1 rounded-full bg-[#7CD8EE]/20 text-[#2F4858] font-semibold">
                                {session.exercices?.length || 0} exercice{(session.exercices?.length || 0) > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    {/* Indicateur de status */}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${session.completed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                        {session.completed ? 'Complétée' : 'À venir'}
                    </div>
                </div>
            </div>

            {/* Détails des exercices (expandable) */}
            {isExpanded && session.exercices && session.exercices.length > 0 && (
                <div className="border-t border-[#7CD8EE]/20 bg-gradient-to-br from-gray-50 to-white">
                    <div className="p-5 space-y-3">
                        <h4 className="text-sm font-bold text-[#2F4858] uppercase tracking-wide">
                            Exercices
                        </h4>
                        <div className="space-y-2">
                            {session.exercices.map((ex: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#7CD8EE]/10 hover:border-[#7CD8EE]/30 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-[#2F4858]">
                                            {ex.exercice?.name || `Exercice ${index + 1}`}
                                        </p>
                                        {ex.exercice?.muscleGroup && (
                                            <p className="text-xs text-[#2F4858]/60 mt-0.5">
                                                {ex.exercice.muscleGroup}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        {ex.sets && (
                                            <span className="px-2 py-1 rounded-lg bg-[#7CD8EE]/10 text-[#2F4858] font-semibold">
                                                {ex.sets} séries
                                            </span>
                                        )}
                                        {ex.reps && (
                                            <span className="px-2 py-1 rounded-lg bg-[#2F4858]/10 text-[#2F4858] font-semibold">
                                                {ex.reps} reps
                                            </span>
                                        )}
                                        {ex.weight && (
                                            <span className="px-2 py-1 rounded-lg bg-[#642F00]/10 text-[#642F00] font-semibold">
                                                {ex.weight} kg
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
