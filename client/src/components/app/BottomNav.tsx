import { NavLink, useLocation } from 'react-router-dom'
import {
  CalendarDaysIcon,
  HomeIcon,
  SparklesIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'

const items = [
  { to: '/programs', icon: ClipboardDocumentCheckIcon },
  { to: '/sessions', icon: CalendarDaysIcon },
  { to: '/', icon: HomeIcon, end: true },
  { to: '/coach', icon: SparklesIcon },
  { to: '/profiles', icon: UserCircleIcon },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 rounded-t-md z-50 bg-[#2F4858]/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(0,0,0,0.15)] border-t border-[#7CD8EE]/20">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        {items.map(({ to, icon: Icon, end }) => {
          const isActive = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive: navIsActive }) =>
                [
                  'flex flex-1 flex-col items-center gap-1 px-2 py-1 text-xs font-semibold transition-transform duration-200',
                  navIsActive || isActive
                    ? 'text-[#7CD8EE] scale-110'
                    : 'text-[#7CD8EE]/60 hover:text-[#7CD8EE]/90',
                ].join(' ')
              }
            >
              <span
                className={[
                  'flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-all duration-200',
                  isActive
                    ? '  border border-[#7CD8EE] shadow-lg'
                    : 'bg-[#2F4858]/80 text-[#7CD8EE] hover:bg-[#7CD8EE]/20',
                ].join(' ')}
              >
                <Icon className="h-6 w-6" />
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
