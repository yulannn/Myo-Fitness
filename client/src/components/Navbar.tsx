import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            MyApp
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label-label="Menu"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium">Accueil</Link>
            <Link to="/profile" className="text-gray-700 hover:text-indigo-600 font-medium">Profil</Link>
            <Link to="/settings" className="text-gray-700 hover:text-indigo-600 font-medium">Paramètres</Link>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 border-t mt-4 pt-4">
            <Link to="/" className="block py-2 text-gray-700 hover:text-indigo-600" onClick={() => setIsOpen(false)}>Accueil</Link>
            <Link to="/profile" className="block py-2 text-gray-700 hover:text-indigo-600" onClick={() => setIsOpen(false)}>Profil</Link>
            <Link to="/settings" className="block py-2 text-gray-700 hover:text-indigo-600" onClick={() => setIsOpen(false)}>Paramètres</Link>
          </div>
        )}
      </div>
    </nav>
  )
}