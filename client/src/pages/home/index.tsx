import { mockUser } from '../../data/mockData'

export default function Home() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Myo Fitness</h1>
        <img src={mockUser.avatarUrl} alt={mockUser.name} className="h-10 w-10 rounded-full" />
      </div>
    </section>
  )
}