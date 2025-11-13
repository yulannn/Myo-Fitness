import { mockEquipment } from '../data/mockData'

export default function Equipment() {
  const categories = Array.from(new Set(mockEquipment.map((item) => item.category)))

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">Équipements</p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Ton inventaire matériel</h1>
        <p className="text-sm text-slate-500">
          Recense tes outils favoris : barres, kettlebells, machines ou accessoires mobilité. Indique leur disponibilité
          pour te simplifier la planification de séance, que tu sois en salle ou à la maison.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
          <button className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-indigo-200 hover:text-indigo-600">
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              {category}
            </button>
          ))}
          <button className="ml-auto rounded-full bg-indigo-600 px-4 py-2 text-white shadow-lg transition hover:bg-indigo-500">
            Ajouter du matériel
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {mockEquipment.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                  <p className="text-xs uppercase tracking-wide text-indigo-500">{item.category}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Utilisation 85%
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">État</p>
                  <p className="text-sm font-semibold text-slate-700">Excellent</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Dernière maintenance</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 text-sm">
                <button className="flex-1 rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
                  Associer à un exercice
                </button>
                <button className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600">
                  Marquer dispo
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

