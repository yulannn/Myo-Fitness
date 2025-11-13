import { Link } from 'react-router-dom'
import { mockUser } from '../../data/mockData'

export default function Home() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Myo Fitness</h1>
        <img src={mockUser.avatarUrl} alt={mockUser.name} className="h-10 w-10 rounded-full" />
      </div>

      <div className="space-y-3">
        <Link
          to="/programs"
          className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">💪</div>
            <div>
              <p className="font-semibold text-slate-900">Programmes</p>
              <p className="text-xs text-slate-500">Mes entraînements</p>
            </div>
          </div>
          <span className="text-slate-400">›</span>
        </Link>

        <Link
          to="/sessions"
          className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">📅</div>
            <div>
              <p className="font-semibold text-slate-900">Sessions</p>
              <p className="text-xs text-slate-500">Planifier</p>
            </div>
          </div>
          <span className="text-slate-400">›</span>
        </Link>

        <Link
          to="/performance"
          className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">📈</div>
            <div>
              <p className="font-semibold text-slate-900">Performances</p>
              <p className="text-xs text-slate-500">Mes stats</p>
            </div>
          </div>
          <span className="text-slate-400">›</span>
        </Link>

        <Link
          to="/coach"
          className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-pink-100 p-3 text-pink-600">🤖</div>
            <div>
              <p className="font-semibold text-slate-900">Coach IA</p>
              <p className="text-xs text-slate-500">Nouveau programme</p>
            </div>
          </div>
          <span className="text-slate-400">›</span>
        </Link>
      </div>
    </section>
  )
}