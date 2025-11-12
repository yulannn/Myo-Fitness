import { Routes, Route } from 'react-router-dom'
import Navbar from "./components/Navbar"
import Home from './pages/Home'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}