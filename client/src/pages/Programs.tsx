import { Link } from 'react-router-dom'
import { mockPrograms } from '../data/mockData'

export default function Programs() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Programmes</h1>
        <Link
          to="/coach"
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Nouveau
        </Link>
      </div>

      <div className="space-y-4">
        {mockPrograms.map((program) => (
          <div key={program.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-slate-500">{program.template.replace(/_/g, ' ')}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{program.name}</p>
                <p className="mt-2 text-sm text-slate-600">{program.sessions.length} sessions</p>
              </div>
              {program.status === 'ACTIVE' && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                  Actif
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {program.sessions.slice(0, 3).map((session) => (
                <div key={session.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-medium text-slate-900">{session.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {session.exercices.length} exercices
                  </p>
                </div>
              ))}
              {program.sessions.length > 3 && (
                <p className="text-xs text-slate-400">+ {program.sessions.length - 3} autres sessions</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

