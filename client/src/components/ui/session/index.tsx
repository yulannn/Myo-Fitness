import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Session as SessionType } from "../../../types/session.type"
import useUpdateSessionDate from "../../../api/hooks/session/useUpdateSessionDate"
import { CalendarIcon, ClockIcon, PlayIcon } from "@heroicons/react/24/outline"
import { Modal, ModalHeader, ModalTitle, ModalFooter, ModalContent } from "../modal"
import Button from "../button/Button"
import { DayPicker } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

interface SessionProps {
    session: SessionType
}

export const SessionCard = ({ session }: SessionProps) => {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        session.date ? new Date(session.date) : undefined
    )
    const { mutate: updateDate, isPending } = useUpdateSessionDate(session.id)

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

    const handleStartSession = () => {
        // Sauvegarder la session dans localStorage
        localStorage.setItem('activeSession', JSON.stringify(session))
        localStorage.setItem('sessionStartTime', Date.now().toString())

        // Naviguer vers la page active session
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
        .date-picker-modal .rdp {
            --rdp-cell-size: 50px;
            --rdp-accent-color: #7CD8EE;
            --rdp-background-color: #7CD8EE;
            margin: 0;
        }
        
        .date-picker-modal .rdp-months {
            justify-content: center;
        }
        
        .date-picker-modal .rdp-caption {
            color: #2F4858;
            font-weight: 700;
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
        }
        
        .date-picker-modal .rdp-nav_button {
            color: #7CD8EE;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.75rem;
            transition: all 0.2s;
        }
        
        .date-picker-modal .rdp-nav_button:hover {
            background-color: rgba(124, 216, 238, 0.2);
            transform: scale(1.1);
        }
        
        .date-picker-modal .rdp-head_cell {
            color: #2F4858;
            font-weight: 700;
            font-size: 0.875rem;
            text-transform: uppercase;
            padding: 0.5rem;
        }
        
        .date-picker-modal .rdp-cell {
            padding: 4px;
        }
        
        .date-picker-modal .rdp-day {
            border-radius: 0.75rem;
            font-weight: 600;
            color: #2F4858;
            transition: all 0.2s;
            font-size: 1rem;
        }
        
        .date-picker-modal .rdp-day:hover:not(.rdp-day_selected) {
            background-color: rgba(124, 216, 238, 0.2) !important;
            transform: scale(1.05);
        }
        
        .date-picker-modal .rdp-day_selected {
            background: linear-gradient(135deg, #7CD8EE 0%, #2F4858 100%) !important;
            color: white !important;
            font-weight: 800;
            box-shadow: 0 4px 12px rgba(124, 216, 238, 0.4);
            transform: scale(1.1);
        }
        
        .date-picker-modal .rdp-day_today:not(.rdp-day_selected) {
            font-weight: 800;
            background-color: rgba(100, 47, 0, 0.15);
            color: #642F00;
            border: 2px solid #642F00;
        }
        
        .date-picker-modal .rdp-day_outside {
            opacity: 0.3;
        }
        
        .date-picker-modal .rdp-day_disabled {
            opacity: 0.3;
            color: #999 !important;
            background-color: transparent !important;
            cursor: not-allowed !important;
            text-decoration: line-through;
        }
        
        .date-picker-modal .rdp-day_disabled:hover {
            background-color: transparent !important;
            transform: none !important;
        }
    `

    return (
        <>
            <style>{customStyles}</style>
            <article
                className="
                    rounded-2xl p-5 
                    bg-[#2F4858]
                    backdrop-blur-xl 
                    border border-[#7CD8EE]/10 
                    shadow-[0_4px_18px_rgba(0,0,0,0.4)]
                    transition-all 
                    hover:shadow-[0_6px_22px_rgba(0,0,0,0.55)]
                    hover:border-[#7CD8EE]/30
                    hover:scale-[1.01]
                "
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="mb-3">
                            {session.date ? (
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-[#7CD8EE]" />
                                    <div className="text-base font-semibold text-white capitalize">
                                        {formatDisplayDate(session.date)}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-[#7CD8EE]/40" />
                                    <div className="text-base font-semibold text-[#7CD8EE]/40 italic">
                                        Aucune date planifiée
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[#7CD8EE]/80">
                            <ClockIcon className="h-4 w-4" />
                            <span>Durée : {session.duration ?? "—"} min</span>
                        </div>

                        {!session.completed && (
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="
                                        flex-1 px-4 py-2 
                                        rounded-xl
                                        bg-gradient-to-r from-[#7CD8EE] to-[#7CD8EE]/80
                                        hover:from-[#7CD8EE]/90 hover:to-[#7CD8EE]/70
                                        text-[#2F4858] font-bold text-sm
                                        shadow-lg hover:shadow-xl
                                        transition-all duration200
                                        hover:scale-105
                                        flex items-center justify-center gap-2
                                    "
                                >
                                    <CalendarIcon className="h-4 w-4" />
                                    {session.date ? 'Modifier' : 'Planifier'}
                                </button>

                                <button
                                    onClick={handleStartSession}
                                    className="
                                        flex-1 px-4 py-2 
                                        rounded-xl
                                        bg-gradient-to-r from-green-500 to-green-600
                                        hover:from-green-600 hover:to-green-700
                                        text-white font-bold text-sm
                                        shadow-lg hover:shadow-xl
                                        transition-all duration-200
                                        hover:scale-105
                                        flex items-center justify-center gap-2
                                    "
                                >
                                    <PlayIcon className="h-4 w-4" />
                                    Démarrer
                                </button>
                            </div>
                        )}
                    </div>

                    <div
                        className={`
                            px-3 py-1 rounded-full text-xs font-semibold border shrink-0
                            ${session.completed
                                ? "bg-[#7CD8EE]/20 text-[#7CD8EE] border-[#7CD8EE]/40"
                                : "bg-[#642f00]/20 text-[#ffffff] border-[#642f00]/40"
                            }
                        `}
                    >
                        {session.completed ? "Terminée" : "Prévue"}
                    </div>
                </div>

                {session.notes && (
                    <p
                        className="
                            mt-4 p-3 rounded-xl text-sm 
                            bg-black/20 text-[#7CD8EE] 
                            border border-[#7CD8EE]/10
                        "
                    >
                        <span className="font-medium text-white">Notes :</span> {session.notes}
                    </p>
                )}

                <ul className="mt-5 space-y-3">
                    {(session.exercices ?? []).map((ex: any) => (
                        <li
                            key={ex.id ?? `ex-${session.id}-${ex.exerciceId}`}
                            className="
                                flex items-start gap-3
                                p-3 rounded-xl
                                bg-white/5
                                border border-white/10
                                hover:border-[#7CD8EE]/30
                                transition
                            "
                        >
                            {/* DOT */}
                            <div
                                className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0"
                                style={{ backgroundColor: "#7CD8EE" }}
                            />

                            {/* EXERCICE INFO */}
                            <div className="text-sm flex-1">
                                <div className="font-semibold text-white">
                                    {ex.exercice?.name ?? `Exercice #${ex.exerciceId}`}
                                </div>
                                <div className="text-[#7CD8EE]/80 mt-0.5">
                                    {ex.reps && `${ex.reps} reps`}
                                    {ex.reps && ex.sets && " • "}
                                    {ex.sets && `${ex.sets} sets`}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </article>

            <Modal isOpen={isModalOpen} onClose={() => !isPending && setIsModalOpen(false)}  >
                <ModalHeader>
                    <ModalTitle>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6 text-[#7CD8EE]" />
                            <span>Planifier la séance</span>
                        </div>
                    </ModalTitle>
                </ModalHeader>

                <ModalContent className="date-picker-modal">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 shadow-inner">
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
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isPending}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirmDate}
                            disabled={!selectedDate || isPending}
                        >
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>Enregistrement...</span>
                                </div>
                            ) : (
                                'Confirmer'
                            )}
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    )
}
