import { useMemo } from 'react'
import { mockPrograms } from '../data/mockData'

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function getStartOfWeek(date: Date) {
  const day = date.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  const start = new Date(date)
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

export default function Sessions() {
  const today = new Date()
  const sessions = mockPrograms.flatMap((program) =>
    program.sessions.map((session) => ({
      ...session,
      programName: program.name,
      scheduledDate: session.scheduledDate ? new Date(session.scheduledDate) : undefined,
    })),
  )

  const { weekSchedule } = useMemo(() => {
    const startOfWeek = getStartOfWeek(new Date())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const grouped = new Map<string, { day: string; dayNumber: number; sessions: typeof sessions }>()

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek)
      currentDay.setDate(startOfWeek.getDate() + i)
      const dayIndex = (currentDay.getDay() + 6) % 7
      const key = WEEK_DAYS[dayIndex]
      grouped.set(key, {
        day: key,
        dayNumber: currentDay.getDate(),
        sessions: [],
      })
    }

    for (const session of sessions) {
      if (!session.scheduledDate || session.scheduledDate < startOfWeek || session.scheduledDate > endOfWeek) {
        continue
      }
      const dayIndex = (session.scheduledDate.getDay() + 6) % 7
      const key = WEEK_DAYS[dayIndex]
      const dayData = grouped.get(key)
      if (dayData) {
        dayData.sessions.push(session)
      }
    }

    return {
      weekSchedule: WEEK_DAYS.map((day) => {
        const dayData = grouped.get(day)!
        return {
          day: dayData.day,
          dayNumber: dayData.dayNumber,
          sessions: dayData.sessions,
          isToday:
            dayData.dayNumber === today.getDate() &&
            startOfWeek.getMonth() === today.getMonth() &&
            startOfWeek.getFullYear() === today.getFullYear(),
        }
      }),
    }
  }, [sessions, today])

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3" style={{ width: 'max-content' }}>
          {weekSchedule.map(({ day, dayNumber, sessions: daySessions, isToday }) => (
            <div
              key={day}
              className={`flex w-[280px] flex-col rounded-2xl p-4 shadow-sm transition ${
                isToday ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-white'
              }`}
            >
              <div className="mb-4 text-center">
                <p className="text-sm font-semibold text-slate-500">{day}</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    isToday ? 'text-indigo-600' : 'text-slate-800'
                  }`}
                >
                  {dayNumber}
                </p>
              </div>

              {daySessions.length > 0 ? (
                <div className="flex flex-1 flex-col gap-3">
                  {daySessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
                    >
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{session.name}</p>
                      <p className="mt-1.5 text-xs text-slate-500">{session.exercices.length} exercices</p>
                      {session.focus && (
                        <p className="mt-1 text-[10px] text-indigo-600">{session.focus}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center py-8">
                  <p className="text-sm text-slate-300">—</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-900">Toutes les sessions</p>
        <div className="mt-4 space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div key={session.id} className="rounded-xl border border-slate-100 p-4">
              <p className="font-medium text-slate-900">{session.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {session.exercices.length} exercices · {session.programName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

