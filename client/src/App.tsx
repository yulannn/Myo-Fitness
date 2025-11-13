import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import FitnessProfiles from './pages/Profile'
import Programs from './pages/Programs'
import Sessions from './pages/Sessions'
import Performance from './pages/Performance'
import Exercises from './pages/Exercises'
import Equipment from './pages/Equipment'
import Community from './pages/Community'
import Settings from './pages/Settings'
import Coach from './pages/Coach'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import BottomNav from './components/BottomNav'

export default function App() {
  return (
    <div className="flex min-h-screen justify-center bg-slate-200/70">
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-slate-50 text-slate-900 shadow-xl">
        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profiles" element={<FitnessProfiles />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/community" element={<Community />} />
            <Route path="/coach" element={<Coach />} />
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