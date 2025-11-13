import { NavLink, useLocation } from 'react-router-dom'
import {
  CalendarDaysIcon,
  HomeIcon,
  SparklesIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'

const items = [
  { to: '/', label: 'Accueil', icon: HomeIcon, end: true },
  { to: '/programs', label: 'Programmes', icon: ClipboardDocumentCheckIcon },
  { to: '/sessions', label: 'Sessions', icon: CalendarDaysIcon },
  { to: '/coach', label: 'Coach', icon: SparklesIcon },
  { to: '/profiles', label: 'Profil', icon: UserCircleIcon },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2.5">
        {items.map(({ to, label, icon: Icon, end }) => {
          const isActive = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive: navIsActive }) =>
                [
                  'flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1 text-[11px] font-medium transition',
                  (navIsActive || isActive) ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600',
                ].join(' ')
              }
            >
              <span
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-2xl text-sm transition',
                  isActive ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-100 text-slate-500',
                ].join(' ')}
              >
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

