import { mockFitnessProfiles } from '../data/mockData'

export default function Coach() {
  const activeProfile = mockFitnessProfiles[0]

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Coach IA</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-900">Créer un programme</p>
        <textarea
          rows={4}
          placeholder="Décris ton objectif, ton niveau, ton équipement..."
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
        />
        <select className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <option>Profil : {activeProfile?.nickname}</option>
          {mockFitnessProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.nickname}
            </option>
          ))}
        </select>
        <button className="mt-4 w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white">
          Générer
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-900">Contexte</p>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Fréquence</span>
            <span className="font-semibold text-slate-900">{activeProfile?.trainingFrequency} séances/sem</span>
          </div>
          <div className="flex justify-between">
            <span>Niveau</span>
            <span className="font-semibold text-slate-900">{activeProfile?.experienceLevel}</span>
          </div>
          <div className="flex justify-between">
            <span>Objectif</span>
            <span className="font-semibold text-slate-900">{activeProfile?.goals[0]?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
