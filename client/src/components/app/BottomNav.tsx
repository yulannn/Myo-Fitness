import { NavLink, useLocation } from 'react-router-dom'
import {
  CalendarDaysIcon,
  HomeIcon,
  Cog6ToothIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import {
  CalendarDaysIcon as CalendarDaysIconSolid,
  HomeIcon as HomeIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
} from '@heroicons/react/24/solid'
import { useSocialNotifications } from '../../api/hooks/social/useSocialNotifications'

const items = [
  { to: '/programs', icon: ClipboardDocumentCheckIcon, iconSolid: ClipboardDocumentCheckIconSolid, label: 'Programme' },
  { to: '/sessions', icon: CalendarDaysIcon, iconSolid: CalendarDaysIconSolid, label: 'Séances' },
  { to: '/', icon: HomeIcon, iconSolid: HomeIconSolid, end: true, label: 'Accueil' },
  { to: '/social', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid, label: 'Social' },
  {
    to: '/settings',
    icon: Cog6ToothIcon,
    iconSolid: Cog6ToothIconSolid,
    label: 'Paramètres',
    matches: ['/settings', '/my-profile', '/change-password', '/privacy', '/premium', '/profile']
  },
]

export default function BottomNav() {
  const location = useLocation()
  const { totalNotifications } = useSocialNotifications()

  // Hide bottom nav on chatbot page for fullscreen experience
  if (location.pathname === '/ai-chatbot') {
    return null
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-[#252527]/95 backdrop-blur-xl shadow-2xl border-t border-[#94fbdd]/10 rounded-t-3xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ to, icon: Icon, iconSolid: IconSolid, end, label, matches }) => {
          const isActive = end
            ? location.pathname === to
            : (matches
              ? matches.some(path => location.pathname.startsWith(path))
              : location.pathname.startsWith(to)
            )
          const ActiveIcon = isActive ? IconSolid : Icon

          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-[64px] group"
            >
              {/* Icon Container */}
              <div className="relative">
                <div
                  className={[
                    'flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 relative',
                    isActive
                      ? 'bg-[#94fbdd] scale-110'
                      : 'bg-[#121214] hover:bg-[#94fbdd]/10 hover:scale-105',
                  ].join(' ')}
                >
                  <ActiveIcon
                    className={[
                      'h-6 w-6 transition-colors duration-300',
                      isActive
                        ? 'text-[#121214]'
                        : 'text-gray-400 group-hover:text-[#94fbdd]'
                    ].join(' ')}
                  />

                  {/* Badge de notification pour l'onglet Social */}
                  {to === '/social' && totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-[#252527] shadow-lg animate-pulse">
                      {totalNotifications > 99 ? '99+' : totalNotifications}
                    </span>
                  )}
                </div>

                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#94fbdd]"></div>
                )}
              </div>

              {/* Label */}
              <span
                className={[
                  'text-[10px] font-medium transition-all duration-300',
                  isActive
                    ? 'text-[#94fbdd] font-semibold'
                    : 'text-gray-500 group-hover:text-gray-400',
                ].join(' ')}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>

      {/* Bottom Safe Area for iOS */}
      <div className="h-safe-area-inset-bottom bg-[#252527]"></div>
    </nav>
  )
}
