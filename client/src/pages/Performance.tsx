import { mockPerformances } from '../data/mockData'

const totalSessions = mockPerformances.length
const successCount = mockPerformances.filter((set) => set.success).length
const successRate = totalSessions > 0 ? Math.round((successCount / totalSessions) * 100) : 0

const performanceSummaryMap = mockPerformances.reduce(
  (acc, set) => {
    const entry = acc.get(set.exerciceName) ?? {
      exerciceName: set.exerciceName,
      bestWeight: 0,
      bestReps: 0,
      lastDate: set.date,
      attempts: 0,
    }
    entry.attempts += 1
    if ((set.weight ?? 0) > (entry.bestWeight ?? 0)) entry.bestWeight = set.weight ?? 0
    if (set.repsCompleted > entry.bestReps) entry.bestReps = set.repsCompleted
    if (new Date(set.date) > new Date(entry.lastDate)) entry.lastDate = set.date
    acc.set(set.exerciceName, entry)
    return acc
  },
  new Map<string, { exerciceName: string; bestWeight: number; bestReps: number; lastDate: string; attempts: number }>(),
)

const performanceSummary = Array.from(performanceSummaryMap.values()).slice(0, 4)

export default function Performance() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Performances</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs text-slate-500">Taux de réussite</p>
        <p className="mt-2 text-4xl font-bold text-indigo-600">{successRate}%</p>
        <div className="mt-4 h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${successRate}%` }} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-900">Meilleurs records</p>
        <div className="mt-4 space-y-4">
          {performanceSummary.map((summary) => (
            <div key={summary.exerciceName} className="rounded-xl border border-slate-100 p-4">
              <p className="font-semibold text-slate-900">{summary.exerciceName}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Charge max</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {summary.bestWeight ? `${summary.bestWeight} kg` : 'Poids du corps'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Reps max</p>
                  <p className="mt-1 font-semibold text-slate-900">{summary.bestReps}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-900">Dernières performances</p>
        <div className="mt-4 space-y-3">
          {mockPerformances.slice(0, 5).map((performance) => (
            <div key={performance.id} className="rounded-xl border border-slate-100 p-4">
              <p className="font-medium text-slate-900">{performance.exerciceName}</p>
              <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
                <span>
                  {performance.repsCompleted}/{performance.repsTarget} reps
                </span>
                {performance.weight && <span>{performance.weight} kg</span>}
                <span
                  className={`ml-auto rounded-full px-2 py-1 text-xs font-semibold ${
                    performance.success ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {performance.success ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

