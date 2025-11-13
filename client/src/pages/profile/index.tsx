// src/pages/FitnessProfiles.tsx
import { mockFitnessProfiles, mockUser } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { useLogout } from '../../api/hooks/useLogout'

export default function FitnessProfiles() {
  const { user } = useAuth()
  const logout = useLogout()

  console.log(user)
  
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
        <button
  onClick={logout}
  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
  Déconnexion
</button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={ mockUser.avatarUrl}
            
            alt={user?.name || mockUser.name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {user?.name || mockUser.name}
            </p>
            <p className="text-sm text-slate-500">{user?.email || mockUser.email}</p>
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
                <p className="mt-1 font-semibold text-slate-900">
                  {profile.currentWeight} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Taille</p>
                <p className="mt-1 font-semibold text-slate-900">{profile.height} cm</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Niveau</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {profile.experienceLevel}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fréquence</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {profile.trainingFrequency} séances/sem
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}