import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, addDays, startOfToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import useGetAllUserSessions from '../../api/hooks/session/useGetAllUserSessions'
import { useSharedSessions } from '../../api/hooks/shared-session/useSharedSessions'
import type { Session } from '../../types/session.type'

export default function WeekCalendarPreview() {
    const navigate = useNavigate()

    // 🎯 Calculer les dates de la semaine actuelle (Lundi → Dimanche)
    const { weekStart, weekEnd, weekDays } = useMemo(() => {
        const today = startOfToday()
        const monday = startOfWeek(today, { weekStartsOn: 1 })
        const sunday = endOfWeek(today, { weekStartsOn: 1 })

        return {
            weekStart: format(monday, 'yyyy-MM-dd'),
            weekEnd: format(sunday, 'yyyy-MM-dd'),
            weekDays: Array.from({ length: 7 }, (_, i) => addDays(monday, i))
        }
    }, [])

    // 🚀 Charger les sessions de TOUTE LA SEMAINE (peut chevaucher 2 mois)
    const { data: sessions } = useGetAllUserSessions(weekStart, weekEnd)
    const { data: sharedSessions } = useSharedSessions()
    const hasSessionOnDate = (date: Date) => {
        if (!sessions) return false
        return sessions.some((session: Session) => {
            const sessionDate = session.performedAt
                ? new Date(session.performedAt)
                : session.date
                    ? new Date(session.date)
                    : null
            if (!sessionDate) return false
            return isSameDay(sessionDate, date)
        })
    }

    const hasSharedSessionOnDate = (date: Date) => {
        if (!sharedSessions) return false
        return sharedSessions.some((session: any) => {
            if (!session.startTime) return false
            return isSameDay(new Date(session.startTime), date)
        })
    }

    const dayRedirect = (date: Date) => {
        if (hasSessionOnDate(date)) return '/sessions'
        if (hasSharedSessionOnDate(date)) return '/sessions'
        return '/'
    }

    const getSessionType = (date: Date): 'both' | 'session' | 'shared' | 'none' => {
        const hasSession = hasSessionOnDate(date)
        const hasShared = hasSharedSessionOnDate(date)

        if (hasSession && hasShared) return 'both'
        if (hasSession) return 'session'
        if (hasShared) return 'shared'
        return 'none'
    }

    return (
        <div className=" border border-white/5 bg-[#18181b] rounded-2xl p-6 space-y-4">


            {/* Week Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                    const isToday = isSameDay(day, startOfToday())
                    const sessionType = getSessionType(day)

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => navigate(dayRedirect(day))}
                            className="flex flex-col items-center cursor-pointer"
                        >
                            {/* Day Name */}
                            <span className="text-xs text-gray-500 font-medium mb-2 uppercase">
                                {format(day, 'EEE', { locale: fr })[0]}
                            </span>

                            {/* Day Circle */}
                            <div
                                className={`
                  relative w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm
                  transition-all duration-200
                  ${isToday
                                        ? 'bg-[#94fbdd]/20 text-[#94fbdd] border border-[#94fbdd]  ring-1 ring-[#94fbdd]/20'
                                        : 'text-gray-400'
                                    }
                  ${sessionType === 'both'
                                        ? 'bg-gradient-to-br from-[#94fbdd]/30 to-purple-500/30 border border-[#94fbdd]/40 ring-1 ring-[#94fbdd]/20'
                                        : sessionType === 'session'
                                            ? 'bg-[#94fbdd]/30 border border-[#94fbdd]/40 ring-1 ring-[#94fbdd]/20'
                                            : sessionType === 'shared'
                                                ? 'bg-purple-500/30 border border-purple-500/40 ring-1 ring-purple-500/20'
                                                : 'bg-[#18181b]'
                                    }
                `}
                            >
                                {format(day, 'd')}

                                {/* Session Indicator Dot */}
                                {sessionType !== 'none' && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                        <div
                                            className={`
                        w-1.5 h-1.5 rounded-full
                        ${sessionType === 'both'
                                                    ? 'bg-gradient-to-r from-[#94fbdd] to-purple-500'
                                                    : sessionType === 'session'
                                                        ? 'bg-[#94fbdd]'
                                                        : 'bg-purple-500'
                                                }
                      `}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
