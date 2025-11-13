import { Routes, Route } from 'react-router-dom'
import Home from './pages/profile'
import Dashboard from './pages/dashboard/dashboard'
import FitnessProfiles from './pages/profile'
import Settings from './pages/settings'
import Login from './pages/login'
import Register from './pages/register'
import BottomNav from './components/app/BottomNav'

export default function App() {
  return (
    <div className="flex min-h-screen justify-center bg-slate-200/70">
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-slate-50 text-slate-900 shadow-xl">
        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profiles" element={<FitnessProfiles />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}