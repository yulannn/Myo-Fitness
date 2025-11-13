import { mockExercises } from '../data/mockData'

export default function Exercises() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Exercices</h1>

      <input
        type="search"
        placeholder="Rechercher..."
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
      />

      <div className="space-y-4">
        {mockExercises.map((exercise) => (
          <div key={exercise.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{exercise.name}</p>
                <p className="mt-1 text-xs text-slate-500">{exercise.muscleGroups.join(' · ')}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {exercise.difficulty}/5
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{exercise.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
