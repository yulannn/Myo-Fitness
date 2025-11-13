import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Bars3Icon,
  BoltIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: RocketLaunchIcon },
  { to: '/programs', label: 'Programmes', icon: BoltIcon },
  { to: '/sessions', label: 'Sessions', icon: ChartBarIcon },
  { to: '/performance', label: 'Performances', icon: ChartBarIcon },
  { to: '/community', label: 'Communauté', icon: UserGroupIcon },
  { to: '/settings', label: 'Paramètres', icon: RocketLaunchIcon },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-2 text-white shadow-lg">
            <RocketLaunchIcon className="h-5 w-5" />
          </span>
          <span className="font-semibold text-slate-800">
            <span className="hidden text-sm uppercase tracking-wide text-indigo-500 sm:block">
              Myo Fitness
            </span>
            <span className="block text-lg sm:text-xl">Coach Studio</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 lg:flex">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive: rnIsActive }) =>
                [
                  'transition-all duration-200',
                  rnIsActive || isActive(to)
                    ? 'text-indigo-600'
                    : 'hover:text-indigo-500',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/auth/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
          >
            Connexion
          </Link>
          <Link
            to="/auth/register"
            className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            Créer un compte
          </Link>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white/95 px-4 py-4 shadow-inner lg:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={({ isActive: rnIsActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
                    rnIsActive || isActive(to)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/auth/login"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              Connexion
            </Link>
            <Link
              to="/auth/register"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}