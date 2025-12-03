import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Session as SessionType } from "../../../types/session.type"
import useUpdateSessionDate from "../../../api/hooks/session/useUpdateSessionDate"
import { CalendarIcon, ClockIcon, PlayIcon, CheckCircleIcon, PencilSquareIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import { Modal, ModalHeader, ModalTitle, ModalFooter, ModalContent } from "../modal"
import { EditSessionModal } from "../modal/EditSessionModal"
import { DayPicker } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

interface SessionProps {
    session: SessionType
    availableExercises?: any[]
    programStatus?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'DRAFT'
}

export const SessionCard = ({ session, availableExercises = [], programStatus }: SessionProps) => {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        session.date ? new Date(session.date) : undefined
    )
    const { mutate: updateDate, isPending } = useUpdateSessionDate(session.id)

    const isArchived = programStatus === 'ARCHIVED'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const handleConfirmDate = () => {
        if (selectedDate) {
            const dateTime = new Date(selectedDate)
            dateTime.setHours(12, 0, 0, 0)

            updateDate(
                { date: dateTime.toISOString() },
                {
                    onSuccess: () => {
                        setIsModalOpen(false)
                    },
                }
            )
        }
    }

    const handleStartSession = (e: React.MouseEvent) => {
        e.stopPropagation()
        localStorage.setItem('activeSession', JSON.stringify(session))
        localStorage.setItem('sessionStartTime', Date.now().toString())
        navigate('/active-session')
    }

    const formatDisplayDate = (date: string | undefined) => {
        if (!date) return null
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

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
    color: #121214 !important;
        background-color: #94fbdd !important;
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
      background: linear-gradient(135deg, rgba(148, 251, 221, 0.4) 0%, rgba(148, 251, 221, 0.25) 100%) !important;
      font-weight: 800;
      box-shadow: 0 3px 10px rgba(148, 251, 221, 0.3);
    }

    .session-day:not(.rdp-day_selected):hover {
      background: linear-gradient(135deg, rgba(148, 251, 221, 0.6) 0%, rgba(148, 251, 221, 0.35) 100%) !important;
      border-color: rgba(148, 251, 221, 1) !important;
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(148, 251, 221, 0.5);
    }

    .shared-session-day:not(.rdp-day_selected) {
      background: linear-gradient(135deg, rgba(147, 51, 234, 0.4) 0%, rgba(124, 58, 237, 0.25) 100%) !important;
      font-weight: 800;
      box-shadow: 0 3px 10px rgba(147, 51, 234, 0.3);
    }

    .shared-session-day:not(.rdp-day_selected):hover {
      background: linear-gradient(135deg, rgba(147, 51, 234, 0.6) 0%, rgba(124, 58, 237, 0.35) 100%) !important;
      border-color: rgba(147, 51, 234, 1) !important;
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(147, 51, 234, 0.5);
    }

    .session-day.rdp-day_today:not(.rdp-day_selected) {
      background: linear-gradient(135deg, rgba(148, 251, 221, 0.5) 0%, rgba(148, 251, 221, 0.2) 100%) !important;
      border: 2.5px solid #94fbdd !important;
      box-shadow: 0 4px 12px rgba(148, 251, 221, 0.4);
    }

    .session-day.rdp-day_selected {
      background: #94fbdd !important;
      border: 3px solid #94fbdd !important;
      box-shadow: 0 8px 20px rgba(148, 251, 221, 0.7);
    }

    .shared-session-day.rdp-day_selected {
      background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%) !important;
      border: 3px solid #9333EA !important;
      box-shadow: 0 8px 20px rgba(147, 51, 234, 0.7);
    }

    /* small safety: for any element using currentColor inside rdp, ensure currentColor is white */
    .rdp, .rdp * {
      color: inherit;
    }
  `

    return (
        <>
            <style>{customStyles}</style>
            <article
                className={`
                    rounded-2xl 
                    bg-[#121214]
                    border border-[#94fbdd]/10 
                    shadow-lg
                    transition-all 
                    hover:shadow-xl
                    hover:border-[#94fbdd]/30
                    overflow-hidden
                `}
            >
                {/* Header cliquable */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-4 sm:p-5 cursor-pointer hover:bg-[#94fbdd]/5 transition-colors"
                >
                    <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-start sm:gap-4">
                        <div className="flex-1 space-y-1">
                            <div>
                                {session.date ? (
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#94fbdd] flex-shrink-0" />
                                        <div className="text-sm sm:text-base font-semibold text-white capitalize break-words">
                                            {formatDisplayDate(session.date)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                                        <div className="text-sm sm:text-base font-semibold text-gray-500 italic">
                                            Aucune date planifiée
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <ClockIcon className="h-4 w-4 flex-shrink-0" />
                                    <span>{session.duration ?? "—"} min</span>
                                </div>
                                <span>•</span>
                                <span>{(session.exercices ?? []).length} exercice{(session.exercices ?? []).length > 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto mt-3 sm:mt-0">
                            <div
                                className={`
                                    px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 flex items-center gap-1.5
                                    ${session.completed
                                        ? "bg-[#94fbdd]/10 text-[#94fbdd] border-[#94fbdd]/30"
                                        : "bg-gray-700 text-gray-400 border-gray-600"
                                    }
                                `}
                            >
                                {session.completed && <CheckCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                <span className="whitespace-nowrap">{session.completed ? "Terminée" : "Prévue"}</span>
                            </div>

                            <div className="p-1.5 rounded-lg bg-[#252527] text-gray-400">
                                {isExpanded ? (
                                    <ChevronUpIcon className="h-5 w-5" />
                                ) : (
                                    <ChevronDownIcon className="h-5 w-5" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu détaillé (Accordéon) */}
                {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-[#94fbdd]/10 pt-4 animate-fadeIn">
                        {!session.completed && !isArchived && (
                            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isArchived) setIsModalOpen(true);
                                    }}
                                    disabled={isArchived}
                                    className={`
                                        flex-1 px-4 py-2.5 
                                        rounded-xl
                                        ${isArchived
                                            ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                                            : 'bg-[#252527] border border-[#94fbdd]/20 hover:bg-[#94fbdd]/10 hover:border-[#94fbdd]/40 text-[#94fbdd]'
                                        }
                                        font-semibold text-sm
                                        transition-all
                                        ${!isArchived && 'active:scale-95'}
                                        flex items-center justify-center gap-2
                                    `}
                                >
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{session.date ? 'Modifier date' : 'Planifier'}</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isArchived) setIsEditModalOpen(true);
                                    }}
                                    disabled={isArchived}
                                    className={`
                                        flex-1 px-4 py-2.5 
                                        rounded-xl
                                        ${isArchived
                                            ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                                            : 'bg-[#252527] border border-yellow-500/20 hover:bg-yellow-500/10 hover:border-yellow-500/40 text-yellow-400'
                                        }
                                        font-semibold text-sm
                                        transition-all
                                        ${!isArchived && 'active:scale-95'}
                                        flex items-center justify-center gap-2
                                    `}
                                >
                                    <PencilSquareIcon className="h-4 w-4" />
                                    <span>Modifier</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isArchived) handleStartSession(e);
                                    }}
                                    disabled={isArchived}
                                    className={`
                                        flex-1 px-4 py-2.5 
                                        rounded-xl
                                        ${isArchived
                                            ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                                            : 'bg-[#94fbdd] hover:bg-[#94fbdd]/90 text-[#121214] shadow-lg shadow-[#94fbdd]/20 hover:shadow-xl hover:shadow-[#94fbdd]/30'
                                        }
                                        font-bold text-sm
                                        transition-all
                                        ${!isArchived && 'active:scale-95'}
                                        flex items-center justify-center gap-2
                                    `}
                                >
                                    <PlayIcon className="h-4 w-4" />
                                    <span>Démarrer</span>
                                </button>
                            </div>
                        )}

                        {session.notes && (
                            <p
                                className="
                                    mb-4 p-3 rounded-xl text-xs sm:text-sm 
                                    bg-[#252527] text-gray-300 
                                    border border-[#94fbdd]/10
                                    break-words
                                "
                            >
                                <span className="font-medium text-[#94fbdd]">Notes :</span> {session.notes}
                            </p>
                        )}

                        <ul className="space-y-2">
                            {(session.exercices ?? []).map((ex: any) => (
                                <li
                                    key={ex.id ?? `ex-${session.id}-${ex.exerciceId}`}
                                    className="
                                        flex items-start gap-2 sm:gap-3
                                        p-3 rounded-xl
                                        bg-[#252527]
                                        border border-[#94fbdd]/10
                                        hover:border-[#94fbdd]/30
                                        transition
                                    "
                                >
                                    <div
                                        className="h-2 w-2 rounded-full mt-1.5 sm:mt-2 shrink-0 bg-[#94fbdd] shadow-lg shadow-[#94fbdd]/50"
                                    />

                                    <div className="text-xs sm:text-sm flex-1 min-w-0">
                                        <div className="font-semibold text-white break-words">
                                            {ex.exercice?.name ?? `Exercice #${ex.exerciceId}`}
                                        </div>
                                        <div className="text-gray-400 mt-0.5">
                                            {ex.reps && `${ex.reps} reps`}
                                            {ex.reps && ex.sets && " • "}
                                            {ex.sets && `${ex.sets} sets`}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </article>


            <Modal isOpen={isModalOpen} onClose={() => !isPending && setIsModalOpen(false)}>
                <ModalHeader>
                    <ModalTitle>
                        <div className="flex items-center gap-2 justify-center text-lg sm:text-2xl">
                            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#94fbdd]" />
                            <span>Planifier la séance</span>
                        </div>
                    </ModalTitle>
                </ModalHeader>

                <ModalContent className="date-picker-modal">
                    <div className="bg-[#121214] rounded-2xl p-3 sm:p-4 border border-[#94fbdd]/10">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={fr}
                            showOutsideDays
                            disabled={[
                                { before: today },
                                isPending ? { after: new Date(9999, 11, 31) } : false
                            ].filter(Boolean) as any}
                        />
                    </div>
                </ModalContent>

                <ModalFooter>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            disabled={isPending}
                            className="w-full px-4 py-3 rounded-xl border border-[#94fbdd]/20 text-gray-300 font-semibold hover:bg-[#121214] transition-all disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleConfirmDate}
                            disabled={!selectedDate || isPending}
                            className="w-full px-4 py-3 rounded-xl bg-[#94fbdd] text-[#121214] font-bold shadow-lg shadow-[#94fbdd]/20 hover:bg-[#94fbdd]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#121214] border-t-transparent" />
                                    <span>Enregistrement...</span>
                                </div>
                            ) : (
                                'Confirmer'
                            )}
                        </button>
                    </div>
                </ModalFooter>
            </Modal>

            {/* Edit Session Modal */}
            <EditSessionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                session={session}
                availableExercises={availableExercises}
            />
        </>
    )
}
