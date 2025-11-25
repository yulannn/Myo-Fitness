import type { Session as SessionType } from "../../../types/session.type"

interface SessionProps {
    session: SessionType
}

export const SessionCard = ({ session }: SessionProps) => {
    return (
        <article
            key={session.id ?? `-${session.date}`}
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
            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-lg font-semibold text-white">
                        {session.date
                            ? new Date(session.date).toLocaleDateString()
                            : "Date à définir"}
                    </div>

                    <div className="text-sm text-[#7CD8EE]/80">
                        Durée : {session.duration ?? "—"} min
                    </div>
                </div>

                <div
                    className={`
                        px-3 py-1 rounded-full text-xs font-semibold border
                        ${session.completed
                            ? "bg-[#7CD8EE]/20 text-[#7CD8EE] border-[#7CD8EE]/40"
                            : "bg-[#642f00]/20 text-[#ffffff] border-[#642f00]/40"
                        }
                    `}
                >
                    {session.completed ? "Terminée" : "Prévue"}
                </div>
            </div>

            {/* NOTES */}
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

            {/* EXERCICES */}
            <ul className="mt-5 space-y-3">
                {(session.exercices ?? []).map((ex: any) => (
                    <li
                        key={ex.id ?? `ex-${session.id}-${ex.exerciceId}`}
                        className="
                            flex items-start gap-3
                            p-2 rounded-xl
                            bg-white/5
                            border border-white/10
                            hover:border-[#7CD8EE]/30
                            transition
                        "
                    >
                        {/* DOT */}
                        <div
                            className="h-2.5 w-2.5 rounded-full mt-1.5"
                            style={{ backgroundColor: "#7CD8EE" }}
                        />

                        {/* EXERCICE INFO */}
                        <div className="text-sm">
                            <span className="font-semibold text-white">
                                {ex.exercice?.name ?? `Exercice #${ex.exerciceId}`}
                            </span>
                            <span className="text-[#7CD8EE]/80">
                                {ex.reps && ` — ${ex.reps} reps`}
                                {ex.sets && ` • ${ex.sets} sets`}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </article>
    )
}
