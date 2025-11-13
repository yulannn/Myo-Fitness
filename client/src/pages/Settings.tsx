import { mockUser } from '../data/mockData'

export default function Settings() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">Paramètres</p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Oriente ton expérience Myo Fitness</h1>
        <p className="text-sm text-slate-500">
          Ajuste ton profil, les préférences d’affichage, les rappels et la synchronisation. Toutes les sections restent
          sans action serveur : c’est une maquette navigable.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Profil & identité</h2>
            <p className="text-sm text-slate-500">
              Mets à jour tes infos personnelles, photo et objectif phare de la saison en cours.
            </p>
            <form className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <img src={mockUser.avatarUrl} alt={mockUser.name} className="h-16 w-16 rounded-full border border-indigo-100" />
                <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
                  Changer d’avatar
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Nom complet
                  <input
                    type="text"
                    defaultValue={mockUser.name}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Email
                  <input
                    type="email"
                    defaultValue={mockUser.email}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-600">
                Objectif principal
                <select className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                  <option>Prendre du muscle</option>
                  <option>Perdre du poids</option>
                  <option>Améliorer le cardio</option>
                </select>
              </label>
              <button className="w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500">
                Sauvegarder
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Préférences</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <div>
                  <p className="font-semibold text-slate-900">Mode clair / sombre</p>
                  <p className="text-xs text-slate-400">Ajuste l’apparence de l’interface selon l’heure ou ton envie.</p>
                </div>
                <button className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
                  Basculer
                </button>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <div>
                  <p className="font-semibold text-slate-900">Unités</p>
                  <p className="text-xs text-slate-400">Kilogrammes & kilomètres (modifiable).</p>
                </div>
                <button className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
                  Passer en impérial
                </button>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <div>
                  <p className="font-semibold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-400">Rappels de séance, synthèse hebdo, nouveaux programmes.</p>
                </div>
                <button className="rounded-full bg-indigo-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-indigo-500">
                  Activer
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Synchronisation</h2>
            <p className="text-sm text-slate-500">
              Connecte tes applis de tracking préférées (Apple Health, Garmin, Whoop…) pour importer métriques et
              récupérations.
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <button className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold transition hover:border-indigo-200 hover:text-indigo-600">
                Apple Health · Non connectée
              </button>
              <button className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold transition hover:border-indigo-200 hover:text-indigo-600">
                Garmin Connect · Non connectée
              </button>
              <button className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold transition hover:border-indigo-200 hover:text-indigo-600">
                Whoop · Non connectée
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-500">Sécurité</h2>
            <p className="mt-3 text-sm text-slate-500">
              Active l’authentification forte et reçois un rappel mensuel pour mettre à jour ton mot de passe.
            </p>
            <button className="mt-4 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
              Activer la double authentification
            </button>
            <button className="mt-3 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
              Mettre à jour le mot de passe
            </button>
          </section>

          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-500">Zone sensible</h2>
            <p className="mt-2 text-sm text-rose-600">
              Les actions suivantes sont irréversibles. Comme il s’agit d’une interface statique, aucune donnée ne sera
              modifiée.
            </p>
            <button className="mt-4 w-full rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100">
              Réinitialiser les données
            </button>
            <button className="mt-3 w-full rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600">
              Supprimer mon compte
            </button>
          </section>
        </aside>
      </div>
    </section>
  )
}