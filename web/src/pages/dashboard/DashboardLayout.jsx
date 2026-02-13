// ─────────────────────────────────────────────────────────────
// DashboardLayout – Shared shell for all authenticated pages
// Contains the top nav bar with user info & logout
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  BoltIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  // Initials for avatar
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-background font-montserrat">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <BoltIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide hidden sm:inline">
              MYO <span className="text-primary">FITNESS</span>
            </span>
          </Link>

          {/* Desktop: User info + logout */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
                  <span className="text-primary text-xs font-bold">{initials}</span>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm font-semibold text-white leading-tight">{user?.name}</p>
                <p className="text-xs text-text-secondary leading-tight">
                  {user?.role === 'COACH' ? 'Coach' : 'Pratiquant'}
                </p>
              </div>
            </div>

            <div className="w-px h-8 bg-border-subtle" />

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              {loggingOut ? 'Déconnexion…' : 'Déconnexion'}
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-text-secondary hover:text-white transition-colors"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-4 pb-4 border-b border-border-subtle bg-surface/95 backdrop-blur-xl animate-fade-in-up">
            <div className="flex items-center gap-3 py-3">
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
                  <span className="text-primary text-sm font-bold">{initials}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-text-secondary">
                  {user?.role === 'COACH' ? 'Coach' : 'Pratiquant'} — {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium mt-1"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
            </button>
          </div>
        )}
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
