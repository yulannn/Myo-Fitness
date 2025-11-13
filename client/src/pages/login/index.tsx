import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <section className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">Connexion</p>
        <h1 className="text-3xl font-bold text-slate-900">Ravi de te revoir</h1>
        <p className="text-sm text-slate-500">Accède à ton cockpit, tes programmes et tes recommandations IA.</p>
      </div>
      <form className="space-y-4">
        <label className="block text-sm text-slate-600">
          Email
          <input
            type="email"
            placeholder="tu@exemple.com"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="block text-sm text-slate-600">
          Mot de passe
          <input
            type="password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-slate-500">
            <input type="checkbox" className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-200" />
            Se souvenir de moi
          </label>
          <Link to="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Mot de passe oublié ?
          </Link>
        </div>
        <button className="w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500">
          Se connecter
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{' '}
        <Link to="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Créer mon espace
        </Link>
      </p>
    </section>
  )
}

