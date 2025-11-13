import { Link } from 'react-router-dom'
import { mockPrograms, mockUser } from '../../data/mockData'

const upcomingSessions = mockPrograms
  .flatMap((program) => program.sessions.map((session) => ({ ...session, programName: program.name })))
  .filter((session) => (session.scheduledDate ? new Date(session.scheduledDate) > new Date() : false))
  .sort((a, b) => new Date(a.scheduledDate ?? 0).getTime() - new Date(b.scheduledDate ?? 0).getTime())
  .slice(0, 3)

export default function Dashboard() {
  const activeProgram = mockPrograms.find((program) => program.id === mockUser.fitnessProfiles[0]?.activeProgramId)

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Bonjour {mockUser.name.split(' ')[0]}</p>
      </div>

      {activeProgram && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Programme actif</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{activeProgram.name}</p>
          <p className="mt-2 text-sm text-slate-600">{activeProgram.sessions.length} sessions</p>
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs text-slate-500">Streak</p>
        <p className="mt-1 text-3xl font-bold text-indigo-600">{mockUser.streak} jours</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-900">Prochaines sessions</p>
          <Link to="/sessions" className="text-sm text-indigo-600">
            Voir tout
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{session.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {session.scheduledDate
                    ? new Date(session.scheduledDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
                    : 'Non planifié'}
                </p>
                <p className="mt-2 text-xs text-slate-400">{session.exercices.length} exercices</p>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-400">Aucune session</p>
          )}
        </div>
      </div>

      <Link
        to="/coach"
        className="block rounded-2xl from-indigo-500 to-purple-600 p-5 text-center text-white shadow-lg"
      >
        <p className="font-semibold">Créer un programme</p>
        <p className="mt-1 text-sm text-white/80">Avec le coach IA</p>
      </Link>
    </section>
  )
}

