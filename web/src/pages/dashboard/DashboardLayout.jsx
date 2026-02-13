// ─────────────────────────────────────────────────────────────
// DashboardLayout – Shared shell for all authenticated pages
// Contains the top nav bar with user info & logout
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  BoltIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCoach = user?.role === 'COACH';

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  const menuItems = [
    { name: 'Mes Clients', path: '/dashboard/coach', icon: UsersIcon, hide: !isCoach },
    { name: 'Dashboard', path: '/dashboard/user', icon: HomeIcon, hide: isCoach },
    { name: 'Bibliothèque', path: '#', icon: BookOpenIcon, disabled: true },
    { name: 'Calendrier', path: '#', icon: CalendarIcon, disabled: true },
  ].filter(i => !i.hide);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-background text-text font-montserrat flex overflow-hidden">
      {/* ── Desktop Sidebar ───────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col border-r border-border-subtle bg-surface/50 backdrop-blur-xl transition-all duration-300 relative z-40 ${sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-surface border border-border-subtle rounded-full flex items-center justify-center text-primary hover:bg-surface-card transition-colors z-50 shadow-lg"
        >
          {sidebarCollapsed ? (
            <ChevronRightIcon className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-border-subtle overflow-hidden">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BoltIcon className="w-6 h-6 text-primary" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-white tracking-wide whitespace-nowrap">
                MYO <span className="text-primary tracking-tight">FITNESS</span>
              </span>
            )}
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${location.pathname === item.path
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
                } ${item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${location.pathname === item.path ? 'text-primary' : 'group-hover:scale-110 transition-transform'}`} />
              {!sidebarCollapsed && (
                <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
                  {item.name}
                </span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-surface-card border border-border-subtle rounded-md text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-xl uppercase tracking-widest">
                  {item.name}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-border-subtle bg-surface/30">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                <span className="text-primary text-sm font-bold">{initials}</span>
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-text-secondary truncate mt-0.5 uppercase tracking-tighter">
                  {isCoach ? 'Coach Pro' : 'Athlète'}
                </p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-semibold border border-transparent hover:border-red-500/20"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              {loggingOut ? 'Sortie...' : 'Déconnexion'}
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlays ────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-surface z-[70] md:hidden transform transition-transform duration-300 ease-out border-r border-border-subtle shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BoltIcon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-white tracking-widest">
                MYO <span className="text-primary">FITNESS</span>
              </span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)}>
              <XMarkIcon className="w-6 h-6 text-text-secondary" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${location.pathname === item.path
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
                  } ${item.disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}
              >
                <item.icon className="w-6 h-6" />
                <span className="font-bold tracking-wide">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-border-subtle mt-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center ring-2 ring-primary/20 shadow-inner">
                <span className="text-primary text-xl font-black">{initials}</span>
              </div>
              <div>
                <p className="font-black text-white">{user?.name}</p>
                <p className="text-xs text-text-secondary font-medium tracking-wide">
                  {isCoach ? 'Compte Coach' : 'Compte Athlète'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 font-black text-sm transition-all active:scale-95 shadow-lg shadow-red-500/5 mb-2"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border-subtle bg-surface/80 backdrop-blur-xl shrink-0 px-4 flex items-center justify-between z-30">
          <Link to="/" className="flex items-center gap-2">
            <BoltIcon className="w-6 h-6 text-primary" />
            <span className="font-black text-white tracking-widest text-sm">MYO FIT</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/5"
          >
            <Bars3Icon className="w-6 h-6 text-text-secondary" />
          </button>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background relative custom-scrollbar">
          {/* Subtle Ambient Glow */}
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none select-none" />
          <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] -z-10 pointer-events-none select-none" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-8 py-8 md:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

