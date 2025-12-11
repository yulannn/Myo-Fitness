import { useMemo } from 'react'
import { format, addDays, startOfToday, startOfWeek, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import useGetAllUserSessions from '../../api/hooks/session/useGetAllUserSessions'
import { useSharedSessions } from '../../api/hooks/shared-session/useSharedSessions'
import type { Session } from '../../types/session.type'

export default function WeekCalendarPreview() {
    const { data: sessions } = useGetAllUserSessions()
    const { data: sharedSessions } = useSharedSessions()

    const weekDays = useMemo(() => {
        const today = startOfToday()
        const monday = startOfWeek(today, { weekStartsOn: 1 })
        return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
    }, [])
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
                            className="flex flex-col items-center"
                        >
                            {/* Day Name */}
                            <span className="text-xs text-gray-500 font-medium mb-2 uppercase">
                                {format(day, 'EEE', { locale: fr })[0]}
                            </span>

                            {/* Day Circle */}
                            <div
                                className={`
                  relative w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-sm
                  transition-all duration-200
                  ${isToday
                                        ? 'bg-[#94fbdd]/20 text-[#94fbdd] border-1 border-[#94fbdd]/20 ring-1 ring-[#94fbdd]/20'
                                        : 'text-gray-400'
                                    }
                  ${sessionType === 'both'
                                        ? 'bg-gradient-to-br from-[#94fbdd]/30 to-purple-500/30 border border-[#94fbdd]/40 ring-1 ring-[#94fbdd]/20'
                                        : sessionType === 'session'
                                            ? 'bg-[#94fbdd]/30 border border-[#94fbdd]/40 ring-1 ring-[#94fbdd]/20'
                                            : sessionType === 'shared'
                                                ? 'bg-purple-500/30 border border-purple-500/40 ring-1 ring-purple-500/20'
                                                : ''
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
