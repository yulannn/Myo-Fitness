import { mockFitnessProfiles, mockUser } from '../data/mockData'

export default function FitnessProfiles() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Profil</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={mockUser.avatarUrl} alt={mockUser.name} className="h-16 w-16 rounded-full" />
          <div>
            <p className="text-lg font-semibold text-slate-900">{mockUser.name}</p>
            <p className="text-sm text-slate-500">{mockUser.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mockFitnessProfiles.map((profile) => (
          <div key={profile.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-900">{profile.nickname}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Poids</p>
                <p className="mt-1 font-semibold text-slate-900">{profile.currentWeight} kg</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Taille</p>
                <p className="mt-1 font-semibold text-slate-900">{profile.height} cm</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Niveau</p>
                <p className="mt-1 font-semibold text-slate-900">{profile.experienceLevel}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fréquence</p>
                <p className="mt-1 font-semibold text-slate-900">{profile.trainingFrequency} séances/sem</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
