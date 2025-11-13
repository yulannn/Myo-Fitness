import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <section className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">Inscription</p>
        <h1 className="text-3xl font-bold text-slate-900">Construis ton studio connecté</h1>
        <p className="text-sm text-slate-500">Crée un compte gratuit pour orchestrer tes programmes et suivre ta progression.</p>
      </div>
      <form className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-600">
            Prénom
            <input
              type="text"
              placeholder="Alicia"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="text-sm text-slate-600">
            Nom
            <input
              type="text"
              placeholder="Martin"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>
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
        <label className="block text-sm text-slate-600">
          Objectif principal
          <select className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100">
            <option>Prendre du muscle</option>
            <option>Perdre du poids</option>
            <option>Améliorer le cardio</option>
            <option>Maintenir la forme</option>
          </select>
        </label>
        <label className="inline-flex items-start gap-2 text-xs text-slate-500">
          <input type="checkbox" className="mt-1 rounded border-slate-300 text-indigo-500 focus:ring-indigo-200" />
          J’accepte les conditions générales et j’autorise les rappels d’entraînement.
        </label>
        <button className="w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500">
          Créer mon compte
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        Déjà inscrit ?{' '}
        <Link to="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Me connecter
        </Link>
      </p>
    </section>
  )
}

